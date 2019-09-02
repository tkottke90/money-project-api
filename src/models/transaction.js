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
  cycle: {
    type: 'relationship',
    target: 'cycle',
    relationship: 'DURING',
    direction: 'out'
  },
  category: {
    type: 'relationships',
    target: 'category',
    relationship: 'AFFECTS',
    direction: 'out',
    properties: {
      delta: 'float',
      current_value: 'float',
      createdAt: 'isoDate'
    }
  },
  user: {
    type: 'relationship',
    target: 'user',
    direction: 'in',
    relationship: 'CREATED_BY'
  }
};