/* eslint-disable no-unused-vars */
// Implement Feathers Common API 
// https://docs.feathersjs.com/api/databases/common

const errors = require('@feathersjs/errors');
const { AdapterService } = require('@feathersjs/adapter-commons');

class Service extends AdapterService {
  constructor(options) {
    if (!options.Model) {
      throw errors.FeathersError('You must provide a Neode Model');
    }

    let neode = options.Model._neode;

    options.id = typeof options.Model._primary_key === 'object' && options.Model._primary_key[0] !== undefined
      ? options.Model._primary_key[0] : 'id';

    super(options);


    this.options = options;
    this.modelName = this.options.Model._name;
    this.protectedFields = [];
  
    // Get a list of relationship names, then map those to an empty object
    this.relationships = Array.from(options.Model._relationships)
      .map( item => item[1]._name )
      .reduce( (acc, cur) => {
        // By default each relationship will return an empty object or no properties on the node
        return acc = { ...acc, [cur]: () => { return {}; } };
      }, {});

    // If the user provided relationship functions in the options, update the relationships with those functions
    if (options.relationships) {
      // Get the list of the relationships the user entered
      const keys = Object.keys(options.relationships);

      keys.forEach( key => {
        this.relationships[key] = options.relationships[key];
      });
    }
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
    Array.from(map).map( item => output[item[0]] = item[1] );
    return output;
  } 

  /**
   * Converts params.query from feathers query syntax to neode query objects
   * @param {*} queryParams
   * @returns Object with Limit, Skip, Parameters, and Sorting Properties 
   */
  feathersToNeode(queryParams) {
    const operations = {
      $limit: (builder, key, value) => {
        return builder.limit(+value);
      },
      $skip: (builder, key, value) => {
        return builder.skip(+value);
      },
      $sort: (builder, key, value) => {
        const sortParams = Object.keys(value).map( param => {
          return { field: `n.${param}`, order: queryParams.$sort[param] === 1 ? 'ASC' : 'DESC' };
        });

        return builder.orderBy(sortParams);
      },
      $ne: (builder, key, value) => {
        return builder.whereNot(`n.${key}`, value);
      },
      $in: (builder, key, value) => {
        // If field is of a number type, mutate the values to be numbers
        if (['number', 'integer', 'int', 'float'].includes(this.schema[key].type)){
          return builder.whereBetween(`n.${key}`, +value[0], +value[1]);
        }

        // If field is a date/time type, generate raw query to use datetime() function
        if (['date', 'time', 'datetime', 'isoDate'].includes(this.schema[key].type)) {
          return builder.whereRaw(`datetime('${value[0]}') <= datetime(n.${key}) <= datetime('${value[1]}')`);
        }

        return builder.whereBetween(`n.${key}`, value[0], value[1]);
      },
      $nin: (builder, key, value) => {
        // If field is of a number type, mutate the values to be numbers
        if (['number', 'integer', 'int', 'float'].includes(this.schema[key].type)){
          return builder.whereNotBetween(`n.${key}`, +value[0], +value[1]);
        }

        // If field is a date/time type, generate raw query to use datetime() function
        if (['date', 'time', 'datetime', 'isoDate'].includes(this.schema[key].type)) {
          return builder.whereRaw(`NOT datetime('${value[0]}') <= datetime(n.${key}) <= datetime('${value[1]}')`);
        }

        return builder.whereNotBetween(`n.${key}`, value[0], value[1]);
      },
      $lt: (builder, key, value) => {
        return builder.whereRaw(`n.${key} < ${value}`);
      },
      $lte: (builder, key, value) => {
        return builder.whereRaw(`n.${key} <= ${value}`);
      },
      $gt: (builder, key, value) => {
        return builder.whereRaw(`n.${key} > ${value}`);
      },
      $gte: (builder, key, value) => {
        return builder.whereRaw(`n.${key} >= ${value}`);
      }
    };

    let builder = this.neode.query();

    builder.match('n', this.modelName);

    Object.keys(queryParams).map( key => {

      // Grab skip and limit keywords
      if (key === '$limit') {
        builder = operations.$limit(builder, key, queryParams[key]);
        return;
      }

      if (key === '$skip') {
        builder = operations.$skip(builder, key, queryParams[key]);
        return;
      }

      if (key === '$sort') {
        builder = operations.$sort(builder, key, queryParams[key]);
        return;
      }

      if (key === '$select') return;

      if (typeof queryParams[key] !== 'object') {
        builder.where(`n.${key}`, queryParams[key]);
      } else {
        if (Array.isArray(queryParams[key])) {
          builder.where(`n.${key}`, queryParams[key][0]);
          for(let i = 1; i < queryParams[key].length; i++) {
            builder.or(`n.${key}`, queryParams[key][i]);
          }
        } else {
          Object.keys(queryParams[key]).map( prop => {

            if (Number.isNaN(+prop)){
              builder = operations[prop](builder, key, queryParams[key][prop]);
              return;
            } 

            builder.where(`n.${key}`, queryParams[key][prop]);
          });
        }
      }

    });

    return builder.return('n').build();
  }

  async setup(app) {
    this.app = app;
    this.neode = app.get('neo4j');

    this.protectedFields = (await this.neode.models.get(this.modelName))._unique;
    this.schema = (await this.neode.models.get(this.modelName))._schema;
  } 

  async find(params) {
    // Process feathers query syntax and convert to cypher
    const query = this.feathersToNeode(params.query);
    let result = await this.neode.cypher(query.query, query.params);

    // If the 'raw' param is set, return the neode node rather than the property object
    if (params.raw) {
      return result;
    }

    result = result.records.map( record => {
      return record._fields[0].properties;
    });

    if (params.query.$select) {
      result = result.map( record => {
        const selectedRecord = {};
        params.query.$select.map( item => {
          selectedRecord[item] = record[item];
        });

        return selectedRecord;
      });
    }

    return this.generatePaginate(result);
  }

  async get(id, params) {
    const node = await this.neode.first(this.modelName, 'id', id);

    // If the query returns null, then no record found to be patched
    if (!node) return new errors.Conflict('Invalid ID');

    return params.raw ? node : this.toObject(node._properties);
  }

  async create(data, params) {    
    // Compare data to model
    const model = this.neode.models.get(this.modelName);
    const schema = this.toObject(model._properties);

    // Extract relationships from data object and add them to params
    const relationships = this.toObject(model._relationships);
    Object.keys(relationships).map( key => {
      if (!params.relationships) {
        params.relationships = {};
      }

      params.relationships[key] = data[key];
      delete data[key];
    });


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
    data = { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    // Send to neo4j
    const result = await this.neode.create(this.modelName, data);

    return params.raw ? result : this.toObject(result._properties);
  }
    
  async patch(id, data, params) {
    // Compare data to model
    const model = this.neode.models.get(this.modelName);

    const node = await this.neode.first(this.modelName, 'id', id);

    // If the query returns null, then no record found to be patched
    if (!node) return new errors.Conflict('Invalid ID');

    const nodeProperties = this.toObject(node._properties);

    // Check if data attempts to change protected fields, currency unique fields are protected
    for (let key of this.protectedFields) {
      // Check if the 
      if (data[key] && data[key] !== nodeProperties[key]) {
        return new errors.Conflict('Attempt to change a protected field', { field: key, value: data[key] });
      }
    }

    // Check/add fields marked as required.  Neode requires that updates include required fields
    Object.keys(model._schema).map( key => {
      if (model._schema[key].required) {
        data[key] = nodeProperties[key];
      }
      return key;
    });

    // All nodes have an updatedAt field, update that field
    data.updatedAt = new Date().toISOString();

    const debug = {
      nodeKeys: Object.keys(node),
      propKeys: Array.from(node._properties),
      data
    };

    const result = await node.update(data);

    return this.toObject(result._properties);
  }

  async update(id, data, params) {
    // Compare data to model
    const model = this.neode.models.get(this.modelName);

    const node = await this.neode.first(this.modelName, 'id', id);

    // If the query returns null, then no record found to be patched
    if (!node) return new errors.Conflict('Invalid ID');

    // Get Node Properties
    const nodeProperties = this.toObject(node._properties);

    // Check if data attempts to change protected fields, currency unique fields are protected
    for (let key of this.protectedFields) {
      // Check if the users entered data matches. If it doesn't, override the users option and leave the field unchanged
      if (data[key] !== nodeProperties[key]) {
        data[key] = nodeProperties[key];
      }
    }

    // Check/add fields marked as required.  Neode requires that updates include required fields
    Object.keys(model._schema).map( key => {
      if (model._schema[key].required && !data[key]) {
        data[key] = nodeProperties[key];
      }
      return key;
    });

    // All nodes have an updatedAt field, update that field
    data.createdAt = nodeProperties.createdAt;
    data.updatedAt = new Date().toISOString();

    await node.delete();

    const result = await this.neode.create(this.modelName, data);
    return this.toObject(result._properties);
  }

  async remove(id, params) {
    // Compare data to model
    const model = this.neode.models.get(this.modelName);

    const node = await this.neode.first(this.modelName, 'id', id);

    // If the query returns null, then no record found to be patched
    if (!node) return new errors.Conflict('Invalid ID');

    const result = await node.delete();

    return result._deleted ? {} : new errors.GeneralError('Unable to Delete Node');
    
  }

  async relationship() {}
}

const init = options => new Service(options);

// Exposed Modules
module.exports = Object.assign(init, {
  default: init,
  Service
});