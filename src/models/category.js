module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  name: {
    type: 'string',
    required: true
  },
  current_value: {
    type: 'number',
    precision: 2
  },
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  }
};