const assert = require('assert');
const app = require('../../src/app');

describe('\'cycle\' service', () => {
  it('registered the service', () => {
    const service = app.service('cycle');

    assert.ok(service, 'Registered the service');
  });
});
