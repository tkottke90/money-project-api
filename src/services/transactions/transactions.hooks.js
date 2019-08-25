const { authenticate } = require('@feathersjs/authentication').hooks;
const createUserLink = require('../../hooks/create-user-link');
const errors = require('@feathersjs/errors');

const logger = require('../../logger');
const manage = require('../../hooks/manage-relationships');

const mapToObject = (map) => {
  const output = {};
  Array.from(map).map( item => output[item[0]] = item[1] );
  return output;
};

const userRelationships = () => {
  return async context => {




    return context;
  };
};

const manageRelationships = () => {
  return async context => {
    // Check if node has any relationships
    if (context.params.relationships) {
      const neode = context.app.get('neo4j');

      // Iterate over relationships found in the schema
      for (let key of Object.keys(context.params.relationships)) {
        // Get node created by this method call
        const transactionNode = await neode.first( context.path, 'id', context.result.id );

        // Get the javascript type of the data
        const relationshipType = (() => {
          try {
            if (typeof context.params.relationships[key] === 'object') {
              return Array.isArray(context.params.relationships[key]) ? 'object-array' : 'object';
            }
            return typeof context.params.relationships[key];
          } catch(error) {
            logger.error('error in relationship type', error);
          }
        })();

        /**
         * Object that handles generating the relationships via the neode interface
         */
        const inputType = {
          'undefined': () => { return; },
          'object': () => {
            logger.info(`Relationship of ${key} is set as an object - no OGM implementation at this time`, { data: context.params.relationships[key] });
          },
          'object-array': async () => {
            // Iterate over array
            const elements = await Promise.all(context.params.relationships[key].map( async item => {
              let partner;
              // Get Node or Create New Node
              partner = await neode.models.get(key).first('name', item.name);
              
              console.log(item.name, Object.keys(partner));

              // If no match is found, create node
              if (!partner) {
                partner = await context.app.service(key).create(item, { user: context.params.user, raw: true });
              }

              const result = await transactionNode.relateTo(partner, key, { value: item.value });
              logger.debug(item.name, Object.keys(result));

              if (!result) {
                logger.error('unable to generate relationship', context.path, key, context.params.relationship[key] );
                return null;
              }
            
              return mapToObject(partner._properties);
            }));

            return elements.filter( elem => !!elem );
          },
          'default': async () => {
            let partner;
            partner = await neode.models.get(key).first('name', context.params.relationships[key]);

            if (!partner) {
              partner = await neode.create(key, { name: context.params.relationships[key]} );
            }
        
            const result = await transactionNode.relateTo(partner, key, {});

            if (!result) {
              logger.error('unable to generate relationship', context.path, key, context.params.relationship[key] );
              return null;
            } 
              
            return mapToObject(partner._properties);
          }
        };

        // Try to get
        try {
          if (Object.keys(inputType).includes(relationshipType)) {
            context.result[key] = await inputType[relationshipType]();
          } else {
            context.result[key] = await inputType.default();
          }
        } catch (error) {
          context.result[key] = { error: { name: error.name,  message: error.message, data: error.data }};
          logger.error(`Error Generating Result for ${key}`, { error: { name: error.name, message: error.message, data: error}, relationship: context.params.relationship[key]  })
        }

      } 
    }
    return context;
  };
};


module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createUserLink(), manage() ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
