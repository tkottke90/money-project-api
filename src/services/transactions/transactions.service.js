// Initializes the `transactions` service on path `/transactions`
const createService = require('../../../neode-module.js/feathers-service');
const hooks = require('./transactions.hooks');
const relationships = require('./transactions.relationships');

module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = app.get('neo4j').model('transaction');

  const options = {
    paginate,
    Model,
    relationships
  };

  // Initialize our service with any options it requires
  app.use('/transaction', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('transaction');

  service.hooks(hooks);
};
