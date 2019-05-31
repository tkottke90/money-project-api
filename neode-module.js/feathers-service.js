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

  setup(app) {
    this.app = app;
    this.neode = app.get('neo4j');
  } 

  async find(params) {
    const limit = params.query.$limit || 10;
    const skip = params.query.$skip || 0;

    const modelName = this.options.Model._name;

    console.log(this.neode.models.get(modelName));

    let result = await this.neode.all(modelName, {}, {}, limit, skip);
    
    delete result._neode;
    result = result._values.map( val => {
      const nodes = {};

      for (let prop of val._properties) {
        nodes[prop[0]] = prop[1];
      }

      return nodes;
    });

    console.log(result, limit, skip);
    
    return this.generatePaginate(result);
  }

  get(id, params) {}

  create(data, params) {
    const modelName = 
    // let result = await this.neode.create()
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