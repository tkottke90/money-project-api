module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  name: {
    type: 'string',
    regex: /\d{4}-\d{2}/
  },
  start_date: {
    type: 'isoDate',
    required: true
  },
  end_date: {
    type: 'isoDate',
    required: true
  },
  createdAt: {
    type: 'isoDate'
  },
  updatedAt: {
    type: 'isoDate'
  },
  user: {
    type: 'relationship',
    target: 'user',
    direction: 'in',
    relationship: 'OWNER',
    properties: {
      current: 'boolean'
    },
  }
};