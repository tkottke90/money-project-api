// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
/**
* Generate link to current user if the schema defines a link
*/
module.exports = () => {
  return async context => {
    // If there is a user relationship in the schema
    if (context.service.schema.user && context.result.type !== 'FeathersError'){
      const neode = context.app.get('neo4j');
      const user = await neode.first('user', 'id', context.params.user.id);
      const node = await neode.first(context.path, 'id', context.result.id);

      // Create Relationship
      await node.relateTo(user, 'user', {});
    }
    return context;
  };
};
