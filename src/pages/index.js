import { Component } from 'react';
import { connect } from 'dva';
import { Card, List } from 'antd';
import { values } from 'lodash';

class Index extends Component {
  render() {
    const { organizations } = this.props;

    return (
      <div>
        <ul>
          <li>
            To get started, edit <code>src/pages/index.js</code> and save to reload.
          </li>
          <li>
            <a href="https://umijs.org/guide/getting-started.html">Getting Started</a>
          </li>
        </ul>

        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          }}
          dataSource={values(organizations.items)}
          renderItem={item => (
            <List.Item>
              <Card title={item.title}>Card content</Card>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default connect(state => {
  return { organizations: state.organizations };
})(Index);
