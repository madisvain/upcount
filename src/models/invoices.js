export default {
  namespace: 'invoices',

  state: {
    items: [{
      id: 1,
      number: '1',
      client: 'John Brown',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 100
    }, {
      id: 2,
      number: '2',
      client: 'Jim Green',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 200
    }, {
      id: 3,
      number: '3',
      client: 'Joe Black',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 300
    }]
  },

  effects: {
  },

  reducers: {
  }
};