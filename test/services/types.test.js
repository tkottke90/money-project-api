const assert = require('assert');
const app = require('../../src/app');

describe('\'types\' service', () => {
  it('registered the service', () => {
    const service = app.service('transaction_types');

    assert.ok(service, 'Registered the service');
  });
});
