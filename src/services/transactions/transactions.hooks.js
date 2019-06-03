const { authenticate } = require('@feathersjs/authentication').hooks;
const createUserLink = require('../../hooks/create-user-link');
const errors = require('@feathersjs/errors');

const manageRelationships = () => {
  return async context => {
    // Check if node has any relationships
    if (context.params.relationships) {

    }

    return context;
  };
};

const processResultAfter = () => {
  return async context => {

    throw new errors.GeneralError('test', { context: context.params, result: context.result });

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
    create: [createUserLink(), processResultAfter()],
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
