// Implement Feathers Common API 
// https://docs.feathersjs.com/api/databases/common

const errors = require('@feathersjs/errors');
const { AdapterService } = require('@feathersjs/adapter-commons');

class Service extends AdapterService {
  constructor(options) {
    if (!options.Model) {
      throw errors.FeathersError('You must provide a Neode Model');
    }

    super(options);


    this.options = options;
    this.modelName = this.options.Model._name;
  }

  generatePaginate(data, limit = 0, skip = 0) {
    if (this.options.paginate) {
      return {
        total: data.length,
        limit,
        skip,
        data
      };
    } 
    return data;
  }

  toObject(map) {
    const output = {};
    map.map( item => output[item[0]] = item[1] );
    return output;
  } 

  setup(app) {
    this.app = app;
    this.neode = app.get('neo4j');
  } 

  async find(params) {
    const limit = params.query.$limit || 10;
    const skip = params.query.$skip || 0;

    const modelName = this.options.Model._name;

    let result = await this.neode.all(modelName, {}, {}, limit, skip);
    
    delete result._neode;
    result = result._values.map( val => {
      const nodes = {};

      for (let prop of val._properties) {
        nodes[prop[0]] = prop[1];
      }

      return nodes;
    });

    
    return this.generatePaginate(result);
  }

  get(id, params) {}

  async create(data, params) {    
    // Compare data to model
    const model = this.neode.models.get(this.modelName);
    const schema = this.toObject(Array.from(model._properties));

    // Check for conflicting data properties
    for (let property of Object.keys(data)) {
      // Check for fields that are not listed in the model in the data object
      if (!Object.keys(schema).includes(property)) return new errors.Conflict('Value Not Part of Model!', { model: this.modelName, property });
      
      // Check if schema defines the field as unique
      if (schema[property]._unique) {
        const unique = await this.neode.cypher(`MATCH (n:${this.modelName}) WHERE n.${property}="${data[property]}" RETURN count(n)`);

        if (unique.records[0]._fields[0].low > 0) return new errors.Conflict('Unique Value In Use', { model: this.modelName, property: { name: property, value: data[property] }});
      }
    }

    // Add createdAt and updatedAt properties
    data = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }

    // Send to neo4j
    const result = await this.neode.create(this.modelName, data);

    return this.toObject(Array.from(result._properties));
  }
    
  patch(id, data, params) {}

  update(id, data, params) {}

  remove(id, params) {}
}

const init = options => new Service(options);

// Exposed Modules
module.exports = Object.assign(init, {
  default: init,
  Service
});