const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const onCreateFromTransaction = require('../../src/hooks/on-create-from-transaction');

describe('\'onCreateFromTransaction\' hook', () => {
  let app;

  beforeEach(() => {
    app = feathers();

    app.use('/dummy', {
      async get(id) {
        return { id };
      }
    });

    app.service('dummy').hooks({
      before: onCreateFromTransaction()
    });
  });

  it('runs the hook', async () => {
    const result = await app.service('dummy').get('test');
    
    assert.deepEqual(result, { id: 'test' });
  });
});
