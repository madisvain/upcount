import { Component } from 'react';
import { Icon, Menu, Layout } from 'antd';
import { get } from 'lodash';

import Link from 'umi/link';
import withRouter from 'umi/withRouter';
import pathToRegexp from 'path-to-regexp';

class Navigation extends Component {
  state = {
    selectedMenuKeys: [],
    openKeys: [],
  };

  componentDidMount() {
    const pathname = get(this.props, ['location', 'pathname']);
    const match = pathToRegexp(`/(.*)`).exec(pathname);
    const pathArr = get(match, 1).split('/');
    this.setState({
      selectedMenuKeys: pathArr,
      openKeys: pathArr[0] === 'settings' ? ['settings'] : [],
    });
  }

  onCollapse = collapsed => {
    this.setState({ collapsed });
  };

  render() {
    return (
      <Layout.Sider
        trigger={null}
        collapsible
        collapsed={this.props.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="logo" style={{ height: 22, margin: '21px 16px', textAlign: 'center' }}>
          <Link to="/invoices/" onClick={() => this.setState({ selectedMenuKeys: ['invoices'] })}>
            <img src={require(`../../assets/logo.svg`)} alt="Upcount" />
          </Link>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
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
            <Menu.Item key="organization">
              <Link to="/settings/organization">
                <Icon type="contacts" /> Organization
              </Link>
            </Menu.Item>
            <Menu.Item key="invoice">
              <Link to="/settings/invoice">
                <Icon type="contacts" /> Invoice
              </Link>
            </Menu.Item>
            <Menu.Item key="tax-rates">
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

export default withRouter(Navigation);
