const Neode = require('neode');
const fileSystem = require('fs');

/**
 * Neode module designed to initialize the neode npm module
 * @module FeathersNeode
 * 
 * @param {object} app Express.js application instance
 */
module.exports = (app) => {
  const { url, username, password } = app.get('neode');
    
  if (!url || !username || !password) {
    throw Error('Missing Neo4j Configuration');
  }
    
  const neode = new Neode(
    url,
    username,
    password
  );

  if (!fileSystem.existsSync(process.cwd() + '/src/models')){
    throw Error(`No Models Found in ${process.cwd()}/src/models`);
  }

  neode.withDirectory(process.cwd() + '/src/models');

  

  app.set('neo4j', neode);
};