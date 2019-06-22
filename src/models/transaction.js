module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  timestamp: {
    type: 'isoDate',
    required: true
  },
  description: {
    type: 'string'
  },
  total: {
    type: 'float',
    precision: 2
  },
  createdAt: {
    type: 'isoDate'
  },
  updatedAt: {
    type: 'isoDate'
  },
  transaction_type: {
    type: 'relationship',
    target: 'transaction_type',
    relationship: 'TYPE_OF_TRANSACTION',
    direction: 'out'
  },
  category: {
    type: 'relationships',
    target: 'category',
    relationship: 'AFFECTS',
    direction: 'out',
    properties: {
      delta: 'float',
      result: 'float'
    }
  },
  user: {
    type: 'relationship',
    target: 'user',
    direction: 'in',
    relationship: 'CREATED_BY'
  }
};