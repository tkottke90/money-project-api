module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    required: true
  },
  year: {
    type: 'number',
    required: true,
    integer: true,
    min: 1990,
    max: 3000
  },
  start_date: {
    type: 'datetime',
    required: true
  },
  end_date: {
    type: 'datetime',
    required: true
  },
  createdAt: {
    type: 'datetime'
  },
  updatedAt: {
    type: 'datetime'
  }
};