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
  }
};