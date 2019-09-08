const logger = require('../../logger');

const { authenticate } = require('@feathersjs/authentication').hooks;
const createUserLink = require('../../hooks/create-user-link');
const manage = require('../../hooks/manage-relationships');

const linkToCycle = () => {
  return async context => {
    const neode = context.app.get('neo4j');
    const builder = neode.query();

    const { records } = await builder.match('c', 'cycle')
      .relationship('OWNER', 'in', 'r')
      .to('u', 'user')
      .where('r.current', true)
      .return('c')
      .execute();

    // Check if there is a cycle associated with the current user
    if (records.length !== 0) {
      // If there is get the node object from neode
      const cycle = await neode.findById('cycle', records[0]._fields[0].identity.low);
      const transaction = await neode.first('transaction', 'id', context.result.id);

      try {
        await transaction.relateTo(cycle, 'cycle');
        logger.info(`Relationship from transaction to cycle created`, { user: context.params.user.id, cycle: cycle._identity.low, transaction: transaction._identity.low });
      } catch (err) {
        logger.error('Error generating link from transaction to cycle');
        logger.error(`Error ${err}`);
      }
    } else {
      logger.warn(`No active cycle for user ${context.params.user.id}`);
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
    create: [createUserLink(), manage(), linkToCycle() ],
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
