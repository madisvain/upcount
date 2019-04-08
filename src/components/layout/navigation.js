import { Component } from 'react';
import { Icon, Menu, Layout } from 'antd';
import { get, last } from 'lodash';

import Link from 'umi/link';
import pathToRegexp from 'path-to-regexp';

class Navigation extends Component {
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
    const { selectedMenuKeys } = this.state;

    return (
      <Layout.Sider trigger={null} collapsible collapsed={this.props.collapsed}>
        <div
          className="logo"
          style={{ height: 32, margin: 16, background: 'rgba(255,255,255,.2)' }}
        />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedMenuKeys}
          onClick={this.handleMenuClick}
        >
          <Menu.Item key="invoices">
            <Link to="/invoices/">
              <div>
                <Icon type="file-text" />
                <span>Invoices</span>
              </div>
            </Link>
          </Menu.Item>
          <Menu.Item key="clients">
            <Link to="/clients/">
              <div>
                <Icon type="team" />
                <span>Clients</span>
              </div>
            </Link>
          </Menu.Item>

          <Menu.SubMenu
            key="settings"
            title={
              <span>
                <Icon type="setting" />
                <span>Settings</span>
              </span>
            }
          >
            <Menu.Item>
              <Link to="/settings/organization">
                <Icon type="contacts" /> Organization
              </Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/settings/invoice">
                <Icon type="contacts" /> Invoice
              </Link>
            </Menu.Item>
            <Menu.Item>
              <Link to="/settings/tax-rates">
                <Icon type="calculator" /> Tax rates
              </Link>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Layout.Sider>
    );
  }
}

export default Navigation;
