import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Dropdown, Input, Layout, Menu, Table, Row, Col } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
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
    const { clients, i18n, invoices } = this.props;
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
        <Menu.Item key="draft">
          <Trans>Draft</Trans>
        </Menu.Item>
        <Menu.Item key="confirmed">
          <Trans>Confirmed</Trans>
        </Menu.Item>
        <Menu.Item key="paid">
          <Trans>Paid</Trans>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="void">
          <Trans>Void</Trans>
        </Menu.Item>
      </Menu>
    );

    const stateFilter = [
      {
        text: i18n._(t`Draft`),
        value: 'draft',
      },
      {
        text: i18n._(t`Confirmed`),
        value: 'confirmed',
      },
      {
        text: i18n._(t`Paid`),
        value: 'paid',
      },
      {
        text: i18n._(t`Void`),
        value: 'void',
      },
    ];

    return (
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
        <Row>
          <Col span={24}>
            <h2>
              <FileTextOutlined style={{ marginRight: 8 }} />
              <Trans>Invoices</Trans>
            </h2>
          </Col>
        </Row>
        <Link to="/invoices/new">
          <Button type="primary" style={{ marginBottom: 10 }}>
            <Trans>New invoice</Trans>
          </Button>
        </Link>
        <Input.Search
          placeholder={i18n._(t`Search text`)}
          onChange={e => this.onSearch(e.target.value)}
          style={{ width: 200, float: 'right' }}
        />

        <Table
          dataSource={search ? searchedInvoiceItems : values(invoices.items)}
          pagination={false}
          rowKey="_id"
        >
          <Table.Column
            title={<Trans>Number</Trans>}
            key="number"
            sorter={(a, b) => (a < b ? -1 : a === b ? 0 : 1)}
            render={invoice => (
              <Link to={`/invoices/${invoice._id}`}>
                <FileTextOutlined />
                {isUndefined(invoice.number) ? ` #${invoice._id}` : ` #${invoice.number}`}
              </Link>
            )}
          />
          <Table.Column
            title={<Trans>Client</Trans>}
            dataIndex="client"
            key="client"
            sorter={(a, b) => (a < b ? -1 : a === b ? 0 : 1)}
            render={client => get(clients.items, `${client}.name`, '-')}
          />
          <Table.Column
            title={<Trans>Date</Trans>}
            dataIndex="date"
            key="date"
            sorter={(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()}
            render={date => (date ? date : '-')}
          />
          <Table.Column
            title={<Trans>Due date</Trans>}
            dataIndex="due_date"
            key="due_date"
            sorter={(a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()}
            render={date => (date ? date : '-')}
          />
          <Table.Column
            title={<Trans>Sum</Trans>}
            key="total"
            sorter={(a, b) => a.total - b.total}
            render={invoice =>
              invoice.currency && invoice.total
                ? Intl.NumberFormat(i18n.language, {
                    style: 'currency',
                    currency: invoice.currency,
                  }).format(invoice.total)
                : '-'
            }
          />
          <Table.Column
            title={<Trans>State</Trans>}
            key="state"
            filters={stateFilter}
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

export default compose(
  withI18n(),
  connect(state => {
    return {
      clients: state.clients,
      invoices: state.invoices,
    };
  })
)(Invoices);
