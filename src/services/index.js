const users = require('./users/users.service.js');
const transactions = require('./transactions/transactions.service.js');
const types = require('./types/types.service.js');
const category = require('./category/category.service.js');
const cycle = require('./cycle/cycle.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(transactions);
  app.configure(types);
  app.configure(category);
  app.configure(cycle);
};
