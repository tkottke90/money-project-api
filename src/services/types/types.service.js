// Initializes the `types` service on path `/types`
const createService = require('../../../neode-module.js/feathers-service');
const hooks = require('./types.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = app.get('neo4j').model('transaction_type');

  const options = {
    paginate,
    Model
  };

  // Initialize our service with any options it requires
  app.use('/types', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('types');

  service.hooks(hooks);
};
