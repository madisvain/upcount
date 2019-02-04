import { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Button, Input, Table, Tag } from 'antd';

class Index extends Component {
  render() {
    const data = [{
      number: '1',
      client: 'Madis',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 100
    }, {
      number: '2',
      client: 'Jim Green',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 200
    }, {
      number: '3',
      client: 'Joe Black',
      state: 'paid',
      date: '2019-01-20',
      due_date: '2019-01-30',
      sum: 300
    }];

    return (
      <div>
        <Link to="/clients/new">
          <Button type="primary" style={{ marginBottom: 10 }}>New client</Button>
        </Link>
        <Input.Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          style={{ width: 200, float: 'right' }}
        />
        <Table dataSource={data} pagination={false}>
          <Table.Column
            title="Name"
            dataIndex="name"
            key="name"
          />
          <Table.Column
            title="Address"
            dataIndex="address"
            key="address"
          />
          <Table.Column
            title="Emails"
            dataIndex="emails"
            key="emails"
          />
          <Table.Column
            title="Phone"
            dataIndex="phone"
            key="phone"
          />
          <Table.Column
            title="VATIN"
            dataIndex="vatin"
            key="vatin"
          />
          <Table.Column
            title="Website"
            dataIndex="website"
            key="website"
          />
        </Table>
      </div>
    )
  }
}

export default connect((state) => { return { invoice: state.invoice }; })(Index);
