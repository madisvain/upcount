import { Component } from 'react';
import Link from 'umi/link';
import { Icon, Menu, Layout } from 'antd';
import { get, last } from 'lodash';
import pathToRegexp from 'path-to-regexp';

class BaseLayout extends Component {
  state = {
    selectedMenuKeys: [],
  };

  componentDidMount() {
    const pathname = get(this.props, ['location', 'pathname']);
    const match = pathToRegexp(`/:selectedMenuKey/(.*)`).exec(pathname);
    const selectedMenuKey = get(match, 1);
    this.setState({ selectedMenuKeys: [selectedMenuKey] });
  }

  handleMenuClick = e => {
    const key = last(e.keyPath);
    switch (key) {
      case 'logout':
        this.props.dispatch({ type: 'auth/logout' });
        break;
      default:
        this.setState({ selectedMenuKeys: [key] });
    }
  };

  render() {
    const { children } = this.props;
    const { selectedMenuKeys } = this.state;

    return (
      <Layout style={{ height: '100vh' }}>
        <Layout.Sider trigger={null} collapsible collapsed={true}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" selectedKeys={selectedMenuKeys} onClick={this.handleMenuClick}>
            <Menu.Item key="invoices">
              <Link to='/invoices/'>
                <div>
                  <Icon type="file-text" />
                  <span>Invoices</span>
                </div>
              </Link>
            </Menu.Item>
            <Menu.Item key="clients">
              <Link to='/clients/'>
                <div>
                  <Icon type="team" />
                  <span>Clients</span>
                </div>
              </Link>
            </Menu.Item>
            <Menu.Item key="settings">
              <Link to='/settings/'>
                <div>
                  <Icon type="setting" />
                  <span>Settings</span>
                </div>
              </Link>
            </Menu.Item>
          </Menu>
        </Layout.Sider>
        <Layout>
          <Layout.Content style={{
            margin: 16, padding: 24, background: '#fff', minHeight: 280,
          }}
          >

            {children}

          </Layout.Content>
        </Layout>
      </Layout>
    );
  }
}

export default BaseLayout;
