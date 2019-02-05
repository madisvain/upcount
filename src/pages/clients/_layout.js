import { Component } from 'react';
import { connect } from 'dva';
import { Button, Input, Table, Tag } from 'antd';

import Link from 'umi/link';

class Clients extends Component {
  render() {
    const { children, clients } = this.props;

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
        <Table dataSource={clients.items} pagination={false} rowKey="id">
          <Table.Column
            title="Name"
            key="name"
            render={client => <Link to={`/clients/${client.id}`}>{client.name}</Link>}
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
        {children}
      </div>
    )
  }
}

export default connect((state) => { return { clients: state.clients }; })(Clients);
