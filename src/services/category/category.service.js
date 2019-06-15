// Initializes the `category` service on path `/category`
const createService = require('../../../neode-module.js/feathers-service');
const hooks = require('./category.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = app.get('neo4j').model('category');

  const options = {
    paginate,
    Model
  };

  // Initialize our service with any options it requires
  app.use('/category', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('category');

  service.hooks(hooks);
};
