// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    if (context.data.change) {
      context.data.current_value = context.data.change;
      delete context.data.change;
    }

    return context;
  };
};
