const logger = require('../logger');

/**
 * Converts a Map into an object
 * @param {Map} map JS Map object
 */
const mapToObject = (map) => {
  const output = {};
  Array.from(map).map( item => output[item[0]] = item[1] );
  return output;
};

/**
 * Manage Relationships hook reviews the relationships in the params.relationships list and
 * generates relationships in Neo4j based on those configurations.  This hook is supported by
 * built in functionality in the Service class which extracts the relationships from the payload
 * before generating a new node.
 */
module.exports = () => {
  return async context => {
    // Check if node has any relationships
    if (context.params.relationships) {
      const neode = context.app.get('neo4j');

      console.log({ path: context.path, property: 'id', result: context.result })
      // Get node created by this method call
      const transactionNode = await neode.model(context.path).first('id', context.result.id );

      // Iterate over relationships found in the schema
      for (let relation of Object.keys(context.params.relationships)) {
        // Get node created by this method call
        const transactionNode = await neode.first( context.path, 'id', context.result.id );


        // Get the javascript type of the data
        const relationshipType = (() => {
          try {
            if (typeof context.params.relationships[relation] === 'object') {
              return Array.isArray(context.params.relationships[relation]) ? 'object-array' : 'object';
            }
            return typeof context.params.relationships[relation];
          } catch(error) {
            logger.error('error in relationship type', error);
            return 'undefined';
          }
        })();

        /**
         * Object that handles generating the relationships via the neode interface
         */
        const inputType = {
          'undefined': () => { return; },
          'object': () => {
            logger.info(`Relationship of ${relation} is set as an object - no OGM implementation at this time`, { data: context.params.relationships[relation] });
          },
          'object-array': async () => {
            // Iterate over array
            const elements = await Promise.all(context.params.relationships[relation].map( async item => {
              let relationProperties;

              // Get node to be related to the initial node.  If it is user specific, get the specific node via
              // a built query, otherwise get the first node that matches by the name property
              let partner = await getPartnerNode(neode, relation, item.name, context.params.user);

              // If no node is found, then generate a new node and generate any properties for the relationship 'node'
              if (!partner){
                partner = await context.app.service(relation).create(item, { user: context.params.user, raw: true });
                relationProperties = await context.app.service(context.path).relationshipProperties(relation, { nodeA: item, nodeB: partner, newCategory: true });
              } else {
                relationProperties = await context.app.service(context.path).relationshipProperties(relation, { nodeA: item, nodeB: partner });
              }

              // Relate the 2 nodes in neo4j
              const result = await transactionNode.relateTo(partner, relation, relationProperties);

              // Log error if issues generating relationship
              if (!result) {
                logger.error('unable to generate relationship', context.path, relation, context.params.relationship[relation] );
                return null;
              }

              logger.log('info', 'Relationship successfully created', { user: context.params.user.id, nodeA: transactionNode._identity.low, nodeB: partner._identity.low });
              return mapToObject(partner._properties);
            }));

            return elements.filter( elem => !!elem );
          },
          'default': async () => {
            // Get node to be related to the initial node.  If it is user specific, get the specific node via
            // a built query, otherwise get the first node that matches by the name property
            let partner = await getPartnerNode(neode, relation, context.params.relationships[relation], context.params.user);

            if (!partner) {
              partner = await neode.create(relation, { name: context.params.relationships[relation] } );
            }
        
            const result = await transactionNode.relateTo(partner, relation, {});

            if (!result) {
              logger.error('Unable to generate relationship', context.path, relation, context.params.relationship[context.path] );
              return null;
            } 
            
            logger.log('info', 'Relationship successfully created', { user: context.params.user.id, nodeA: transactionNode._identity.low, nodeB: partner._identity.low });
            return mapToObject(partner._properties);
          }
        };

        try {
          if (Object.keys(inputType).includes(relationshipType)) {
            context.result[relation] = await inputType[relationshipType]();
          } else {
            context.result[relation] = await inputType.default();
          }
        } catch (error) {
          context.result[relation] = { error: { name: error.name,  message: error.message, data: error.data }};

          logger.error(`Error Generating Result for ${relation}`, { error: { name: error.name, message: error.message, stack: error.stack, data: error}, relationship: context.params.relationships[relation]  });
        }

      } 
    }
    return context;
  };
};

/**
 * Get neo4j node that will be related to the currently active node
 * @param {Neode} neode Neode instance
 * @param {String} nodeLabel Neo4j label on the node that is being searched for
 * @param {String} nodeName Name property assigned to the node
 * @param {User} user User object from feathers context
 */
async function getPartnerNode(neode, nodeLabel, nodeName, user) {
  // Check the model ofr a relationship to the user, if one exits we can assert that it must be a user specific node
  const userSpecific = (await neode.models.get(nodeLabel))._relationships.get('user');

  // Get node to be related to the initial node.  If it is user specific, get the specific node via
  // a built query, otherwise get the first node that matches by the name property
  return userSpecific 
    ? await getUserSpecificNode(neode, nodeLabel, nodeName, userSpecific, user)
    : await neode.models.get(nodeLabel).first('name', nodeName);

}

/**
 * Get a node that is associated to a specific user based on the configuration of the node model
 * @param {Neode} neode Neode instance
 * @param {String} nodeLabel Neo4j label on the node that is being searched for
 * @param {String} nodeName Name property assigned to the node
 * @param {Object} userNodeInfo Relationship object from the model that includes information about the relation to the user node
 * @param {User} user User object from feathers context
 */
async function getUserSpecificNode(neode, nodeLabel, nodeName, userNodeInfo, user) {
  // Generate Query Builder Instance
  const queryBuilder = neode.query();

  // Build and Execute Query
  const result = await queryBuilder
    .match('n', nodeLabel)
    .relationship(userNodeInfo._relationship, userNodeInfo._direction.split('_')[1])
    .to('p', 'user' )
    .where('n.name', nodeName)
    .where('p.id', user.id)
    .return('n')
    .execute();

  return result.records.length > 0
    ? await neode.model(nodeLabel).findById(result.records[0]._fields[0].identity.low)
    : false;
}