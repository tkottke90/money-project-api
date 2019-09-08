// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
/**
* Generate link to current user if the schema defines a link
*/

const logger = require('../logger');

module.exports = () => {
  return async context => {

    // If there is a user relationship in the schema
    if (context.params.relationships && Object.keys(context.params.relationships).includes('user')) {
      try {
        const neode = context.app.get('neo4j');
        const user = await neode.first('user', 'id', context.params.user.id);
        const node = await neode.first(context.path, 'id', context.params.raw ? context.result._properties.get('id') : context.result.id);
        
        const nodeInfo = context.params.relationships.user || {};
        // Create Relationship
        await node.relateTo(user, 'user', nodeInfo);

        logger.info(`Create User Link - ${context.path}`, {
          user: context.params.user.id,
          data: {
            user: {
              label: 'user',
              key: 'id',
              value: context.params.user.id
            },
            node: {
              label: context.path,
              key: 'id',
              value: context.params.raw ? context.result._properties.get('id') : context.result.id
            }
          }
        });
      } catch (err) {
        logger.error(err);
      }
      
    }


    return context;
  };
};
