import React, { useState } from 'react';
import { useRxCollection, useRxData } from 'rxdb-hooks';
import { Button, Dropdown, Input, Layout, Menu, Table, Row, Col } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { get, isUndefined } from 'lodash';

import currency from 'currency.js';
import Link from 'umi/link';

import StateTag from '../../components/invoices/state-tag';
import { OrganizationContext } from '../../providers/contexts';

const stateFilter = [
  {
    text: t`Draft`,
    value: 'draft',
  },
  {
    text: t`Confirmed`,
    value: 'confirmed',
  },
  {
    text: t`Paid`,
    value: 'paid',
  },
  {
    text: t`Void`,
    value: 'void',
  },
];

// this.onStateSelect(_id, _rev, key)
const stateMenu = (_id, _rev) => (
  <Menu onClick={({ item, key }) => console.log('')}>
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

const Invoices = props => {
  const { i18n } = props;
  const [search, setSearch] = useState('');

  const invoicesCollection = useRxCollection('invoices');
  const { result: invoices, isFetching } = useRxData('invoices', collection => collection.find());
  const clients = [];

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
        placeholder={t`Search text`}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 200, float: 'right' }}
      />

      <Table dataSource={invoices} pagination={false} rowKey="_id">
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
            invoice.currency && invoice.total ? (
              <OrganizationContext.Consumer>
                {context =>
                  i18n.number(currency(invoice.total), {
                    style: 'currency',
                    currency: invoice.currency,
                    minimumFractionDigits: get(
                      context.state,
                      'organization.minimum_fraction_digits',
                      2
                    ),
                  })
                }
              </OrganizationContext.Consumer>
            ) : (
              '-'
            )
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
};

export default withI18n()(Invoices);
