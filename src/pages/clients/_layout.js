import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Input, Layout, Table, Tag, Row, Col } from 'antd';
import { TeamOutlined, PhoneOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { compact, find, filter, flatten, get, escapeRegExp, pick, isEmpty, values } from 'lodash';

import Link from 'umi/link';

class Clients extends Component {
  state = {
    search: null,
  };

  componentDidMount() {
    this.props.dispatch({ type: 'clients/list' });
  }

  onSearch = value => {
    this.setState({
      search: value,
    });
  };

  render() {
    const { children, clients, i18n } = this.props;
    const { search } = this.state;

    // Search - to be implemented in DB
    let searchedClientItems = [];
    if (search) {
      searchedClientItems = filter(values(clients.items), client => {
        const searchable = flatten(
          compact(values(pick(client, ['name', 'address', 'emails', 'phone', 'vatin', 'website'])))
        );
        return find(searchable, value => {
          return !!~value.search(new RegExp(escapeRegExp(search), 'i'));
        });
      });
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
          onChange={e => this.onSearch(e.target.value)}
          style={{ width: 200, float: 'right' }}
        />
        <Table
          dataSource={search ? searchedClientItems : values(clients.items)}
          pagination={false}
          rowKey="_id"
        >
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
  }
}

export default compose(
  withI18n(),
  connect(state => {
    return { clients: state.clients };
  })
)(Clients);
