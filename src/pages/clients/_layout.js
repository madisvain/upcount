import { Component } from 'react';
import { connect } from 'dva';
import { Button, Icon, Input, Layout, Table, Tag } from 'antd';
import { isEmpty, values } from 'lodash';

import Link from 'umi/link';

class Clients extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'clients/list' });
  }

  render() {
    const { children, clients } = this.props;

    return (
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
        <Link to="/clients/new">
          <Button type="primary" style={{ marginBottom: 10 }}>New client</Button>
        </Link>
        <Input.Search
          placeholder="input search text"
          onSearch={value => console.log(value)}
          style={{ width: 200, float: 'right' }}
        />
        <Table dataSource={values(clients.items)} pagination={false} rowKey="_id">
          <Table.Column
            title="Name"
            key="name"
            render={client => <Link to={`/clients/${client._id}`}>{client.name}</Link>}
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
            render={emails => (
              emails.map((email) => <Tag key={email}>{email}</Tag>)
            )}
          />
          <Table.Column
            title="Phone"
            dataIndex="phone"
            key="phone"
            render={phone => {
              if (!isEmpty(phone)) {
                return (
                  <a href={`tel:${phone}`}>
                    <Icon type="phone" />{` ${phone}`}
                  </a>
                )
              }
            }}
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
            render={website => (
              <a href={website} target="_blank" rel='noreferrer noopener'>
                {website}
              </a>
            )}
          />
        </Table>
        {children}
      </Layout.Content>
    )
  }
}

export default connect((state) => { return { clients: state.clients }; })(Clients);
