import React, { useState } from 'react';
import { useRxData } from 'rxdb-hooks';
import { Button, Input, Layout, Table, Tag, Row, Col, Spin } from 'antd';
import { TeamOutlined, PhoneOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { get, isEmpty } from 'lodash';

import Link from 'umi/link';

const Clients = props => {
  const { children, i18n } = props;
  const [search, setSearch] = useState('');

  const { result: clients, isFetching } = useRxData('clients', collection => collection.find());

  if (isFetching) {
    return <Spin />;
  }

  return (
    <Layout.Content>
      <Row>
        <Col span={24}>
          <h2>
            <TeamOutlined style={{ marginRight: 8 }} />
            <Trans>Clients</Trans>
          </h2>
        </Col>
      </Row>
      <Link to="/clients/new">
        <Button type="primary" style={{ marginBottom: 10 }}>
          <Trans>New client</Trans>
        </Button>
      </Link>
      <Input.Search
        placeholder={i18n._(t`Search text`)}
        onChange={e => setSearch(e.target.value)}
        style={{ width: 200, float: 'right' }}
      />
      <Table dataSource={clients} pagination={false} rowKey="_id">
        <Table.Column
          title={<Trans>Name</Trans>}
          key="name"
          render={client => <Link to={`/clients/${client._id}`}>{get(client, 'name', '-')}</Link>}
        />
        <Table.Column title={<Trans>Address</Trans>} dataIndex="address" key="address" />
        <Table.Column
          title={<Trans>Emails</Trans>}
          dataIndex="emails"
          key="emails"
          render={emails => (emails ? emails.map(email => <Tag key={email}>{email}</Tag>) : '')}
        />
        <Table.Column
          title={<Trans>Phone</Trans>}
          dataIndex="phone"
          key="phone"
          render={phone => {
            if (!isEmpty(phone)) {
              return (
                <a href={`tel:${phone}`}>
                  <PhoneOutlined />
                  {` ${phone}`}
                </a>
              );
            }
          }}
        />
        <Table.Column title={<Trans>VATIN</Trans>} dataIndex="vatin" key="vatin" />
        <Table.Column
          title={<Trans>Website</Trans>}
          dataIndex="website"
          key="website"
          render={website => (
            <a href={website} target="_blank" rel="noreferrer noopener">
              {website}
            </a>
          )}
        />
      </Table>
      {children}
    </Layout.Content>
  );
};

export default withI18n()(Clients);
