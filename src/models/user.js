module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true,
    unique: true
  },
  first_name: {
    type: 'string',
    required: true
  },
  last_name: {
    type: 'string',
    required: true
  },
  email: {
    type: 'email',
    required: true,
    unique: true
  },
  password: {
    type: 'string',
    required: true
  },
  createdAt: {
    type: 'isoDate'
  },
  updatedAt: {
    type: 'isoDate'
  },
  last_login: {
    type: 'isoDate'
  },
  age: {
    type: 'number'
  },
  cycles: {
    type: 'relationship',
    target: 'cycle',
    relationship: 'OWNER',
    direction: 'out',
    properties: {
      current: {
        valid: [ 'yes', 'no' ]
      }
    }
  },
  categories: {
    type: 'relationships',
    target: 'category',
    relationship: 'CREATED_CATEGORY',
    direction: 'out'
  },
  types: {
    type: 'relationships',
    target: 'type',
    relationship: 'CREATED_TYPE',
    direction: 'out'
  }
};