// Initializes the `users` service on path `/users`
const createService = require('../../../neode-module.js/feathers-service');
const hooks = require('./users.hooks');

module.exports = function (app) {
  
  const paginate = app.get('paginate');
  const Model = app.get('neo4j').model('user');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/users', createService(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
};
