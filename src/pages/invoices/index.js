import { Component } from 'react';
import { connect } from 'dva';
import { Button, Dropdown, Icon, Input, Layout, Menu, Table, Row, Col } from 'antd';
import {
  compact,
  flatten,
  filter,
  find,
  get,
  has,
  escapeRegExp,
  isUndefined,
  pick,
  values,
} from 'lodash';

import Link from 'umi/link';

import StateTag from '../../components/invoices/state-tag';

class Invoices extends Component {
  state = {
    search: null,
  };

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

  onSearch = value => {
    this.setState({
      search: value,
    });
  };

  render() {
    const { clients, invoices } = this.props;
    const { search } = this.state;

    let searchedInvoiceItems = [];
    if (search) {
      searchedInvoiceItems = filter(values(invoices.items), invoice => {
        let searchable = flatten(compact(values(pick(invoice, ['number', 'sum']))));
        if (has(invoice, 'client') && has(clients.items, invoice.client)) {
          searchable.push(get(clients.items, [invoice.client, 'name']));
        }
        return find(searchable, value => {
          return !!~value.search(new RegExp(escapeRegExp(search), 'i'));
        });
      });
    }

    const stateMenu = (_id, _rev) => (
      <Menu onClick={({ item, key }) => this.onStateSelect(_id, _rev, key)}>
        <Menu.Item key="draft">Draft</Menu.Item>
        <Menu.Item key="confirmed">Confirmed</Menu.Item>
        <Menu.Item key="payed">Payed</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="void">Void</Menu.Item>
      </Menu>
    );

    const stateFiler = [
      {
        text: 'Draft',
        value: 'draft'
      },
      {
        text: 'Confirmed',
        value: 'confirmed'
      },
      {
        text: 'Payed',
        value: 'payed'
      },
      {
        text: 'Void',
        value: 'void'
      },
    ]

    return (
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
        <Row>
          <Col>
            <h2>
              <Icon type="file-text" style={{ marginRight: 8 }} />
              Invoices
            </h2>
          </Col>
        </Row>
        <Link to="/invoices/new">
          <Button type="primary" style={{ marginBottom: 10 }}>
            New invoice
          </Button>
        </Link>
        <Input.Search
          placeholder="input search text"
          onChange={e => this.onSearch(e.target.value)}
          style={{ width: 200, float: 'right' }}
        />

        <Table
          dataSource={search ? searchedInvoiceItems : values(invoices.items)}
          pagination={false}
          rowKey="_id"
        >
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
            sorter={(a, b) => a < b ? -1 : a === b ? 0 : 1}
            render={client => get(clients.items, `${client}.name`, '-')}
          />
          <Table.Column
            title="Date"
            dataIndex="date"
            key="date"
            sorter={(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()}
            render={date => (date ? date : '-')}
          />
          <Table.Column
            title="Due date"
            dataIndex="due_date"
            key="due_date"
            sorter={(a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()}
            render={date => (date ? date : '-')}
          />
          <Table.Column
            title="Sum"
            dataIndex="total"
            key="total"
            sorter={(a, b) => a.total - b.total}
            render={total => (total ? total : '-')}
          />
          <Table.Column
            title="State"
            key="state"
            filters={stateFiler}
            onFilter={(value, record) => record.state.indexOf(value) === 0}
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
