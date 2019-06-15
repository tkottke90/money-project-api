// Initializes the `cycle` service on path `/cycle`
const createService = require('../../../neode-module.js/feathers-service');
const hooks = require('./cycle.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = app.get('neo4j').model('cycle');

  const options = {
    paginate,
    Model
  };

  // Initialize our service with any options it requires
  app.use('/cycle', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('cycle');

  service.hooks(hooks);
};
