import { Component } from 'react';
import { connect } from 'dva';
import { Button, Dropdown, Icon, Input, Layout, Menu, Table } from 'antd';
import { get, isUndefined, values } from 'lodash';

import Link from 'umi/link';

import StateTag from '../../components/state-tag';

class Invoices extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'invoices/list' });
    this.props.dispatch({ type: 'clients/list' });
  }

  onStateSelect = (_id, _rev, key) => {
    this.props.dispatch({
      type: 'invoices/state',
      payload: {
        _id,
        _rev,
        state: key,
      },
    });
  };

  render() {
    const { clients, invoices } = this.props;

    const stateMenu = (_id, _rev) => (
      <Menu onClick={({ item, key }) => this.onStateSelect(_id, _rev, key)}>
        <Menu.Item key="draft">Draft</Menu.Item>
        <Menu.Item key="confirmed">Confirmed</Menu.Item>
        <Menu.Item key="payed">Payed</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="void">Void</Menu.Item>
      </Menu>
    );

    return (
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
        <Link to="/invoices/new">
          <Button type="primary" style={{ marginBottom: 10 }}>
            New invoice
          </Button>
        </Link>
        <Input.Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          style={{ width: 200, float: 'right' }}
        />

        <Table dataSource={values(invoices.items)} pagination={false} rowKey="_id">
          <Table.Column
            title="Number"
            key="number"
            render={invoice => (
              <Link to={`/invoices/${invoice._id}`}>
                <Icon type="file-text" />
                {isUndefined(invoice.number) ? ` #${invoice._id}` : ` #${invoice.number}`}
              </Link>
            )}
          />
          <Table.Column
            title="Client"
            dataIndex="client"
            key="client"
            render={client => get(clients.items, `${client}.name`, '-')}
          />
          <Table.Column title="Date" dataIndex="date" key="date" />
          <Table.Column title="Due date" dataIndex="due_date" key="due_date" />
          <Table.Column title="Sum" dataIndex="total" key="total" />
          <Table.Column
            title="State"
            key="state"
            render={invoice => (
              <Dropdown overlay={stateMenu(invoice._id, invoice._rev)} trigger={['click']}>
                <StateTag state={invoice.state} />
              </Dropdown>
            )}
          />
        </Table>
      </Layout.Content>
    );
  }
}

export default connect(state => {
  return {
    clients: state.clients,
    invoices: state.invoices,
  };
})(Invoices);
