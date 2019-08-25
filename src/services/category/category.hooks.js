const { authenticate } = require('@feathersjs/authentication').hooks;
const userLink = require('../../hooks/create-user-link');
const onCreateFromTransaction = require('../../hooks/on-create-from-transaction');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ onCreateFromTransaction() ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ userLink() ],
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
