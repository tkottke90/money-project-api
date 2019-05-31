module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  timestamp: {
    type: 'datetime',
    required: true
  },
  description: {
    type: 'string'
  },
  total: {
    type: 'float',
    precision: 2
  },
  transaction_type: {
    type: 'relationship',
    target: 'type',
    relationship: 'TYPE_OF_TRANSACTION',
    direction: 'out'
  },
  generator: {
    type: 'relationship',
    target: 'user',
    relationship: 'GENERATED_BY',
    direction: 'in'
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
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  }
};