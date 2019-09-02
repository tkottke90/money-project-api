const { authenticate } = require('@feathersjs/authentication').hooks;
const userLink = require('../../hooks/create-user-link');
const manage = require('../../hooks/manage-relationships');
const logger = require('../../logger');

/**
 * Function updates the cycles associated with the current user.  The application updates all other cycles associated with the user to false except the one that was just created
 */
const setCycleAsActive = () => {
  return async context => {
    // Get neode 
    const neode = context.app.get('neo4j');

    // Query db for a cycle assigned to the current user with a relationship fo 
    // const result = await neode.cypher(`MATCH (u:User {id: '${context.params.user.id}'})-[r:OWNER]->(c:Cycle) WHERE `)
    const builder = neode.query();

    builder.match('u', 'user')
      .relationship('OWNER', 'out', 'r')
      .to('c', 'cycle')
      .where('r.current', true)
      .whereNot('c.id', context.result.id)
      .set('r.current', false)
      .return('u', 'r', 'c');
    
    // Execute Query
    const result = await builder.execute();

    // Log Result
    logger.info('Update Cycles', result);

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
    create: [setCycleAsActive(), userLink(), manage()],
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
