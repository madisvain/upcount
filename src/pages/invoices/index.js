import { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Button, Input, Table, Tag } from 'antd';

class Invoices extends Component {
  render() {
    const { invoices } = this.props;

    return (
      <div>
        <Link to="/invoices/new">
          <Button type="primary" style={{ marginBottom: 10 }}>New invoice</Button>
        </Link>
        <Input.Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          style={{ width: 200, float: 'right' }}
        />

        <Table dataSource={invoices.items} pagination={false} rowKey="id">
          <Table.Column
            title="Number"
            dataIndex="number"
            key="number"
          />
          <Table.Column
            title="Client"
            dataIndex="client"
            key="client"
          />
          <Table.Column
            title="Date"
            dataIndex="date"
            key="date"
          />
          <Table.Column
            title="Due date"
            dataIndex="due_date"
            key="due_date"
          />
          <Table.Column
            title="Sum"
            dataIndex="sum"
            key="sum"
          />
          <Table.Column
            title="State"
            dataIndex="state"
            key="state"
            render={state => (<Tag color="green">{state}</Tag>)}
          />
        </Table>
      </div>
    )
  }
}

export default connect((state) => { return { invoices: state.invoices }; })(Invoices);