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
    required: true,
    precision: 2
  },
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  },
  user: {
    type: 'relationship',
    target: 'user',
    direction: 'in',
    relationship: 'CREATED_BY'
  }
};