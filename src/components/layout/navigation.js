import { connect } from 'dva';
import { Menu, Layout } from 'antd';
import {
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  BankOutlined,
  FileOutlined,
  CalculatorOutlined,
  WarningOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { compact, get, join, take } from 'lodash';

import Link from 'umi/link';
import moment from 'moment';
import withRouter from 'umi/withRouter';
import pathToRegexp from 'path-to-regexp';

const Navigation = props => {
  const pathname = get(props, ['location', 'pathname']);
  const match = pathToRegexp(`/(.*)`).exec(pathname);
  const pathArr = get(match, 1).split('/');

  const openKeys = pathArr[0] === 'settings' ? ['settings'] : [];
  const selectedKeys = [join(take(compact(pathArr), 2), '.')];

  const organization = get(props.organizations.items, localStorage.getItem('organization'));

  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={props.collapsed}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        zIndex: 10,
      }}
    >
      <div className="logo" style={{ height: 22, margin: '21px 16px', textAlign: 'center' }}>
        <Link to="/">
          {props.collapsed ? (
            <img src={require(`../../assets/logo-minimal.svg`)} alt="Upcount" />
          ) : (
            <img src={require(`../../assets/logo.svg`)} alt="Upcount" />
          )}
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultOpenKeys={openKeys}
        defaultSelectedKeys={selectedKeys}
      >
        <Menu.Item key="invoices">
          <Link to="/invoices">
            <FileTextOutlined />
            <span>
              <Trans>Invoices</Trans>
            </span>
          </Link>
        </Menu.Item>
        <Menu.Item key="clients">
          <Link to="/clients">
            <TeamOutlined />
            <span>
              <Trans>Clients</Trans>
            </span>
          </Link>
        </Menu.Item>
        <Menu.SubMenu
          key="settings"
          title={
            <div>
              <SettingOutlined />
              <span>
                <Trans>Settings</Trans>
              </span>
            </div>
          }
        >
          <Menu.Item key="settings.organization">
            <Link to="/settings/organization">
              <BankOutlined />
              <Trans>Organization</Trans>
            </Link>
          </Menu.Item>
          <Menu.Item key="settings.invoice">
            <Link to="/settings/invoice">
              <FileOutlined />
              <Trans>Invoice</Trans>
            </Link>
          </Menu.Item>
          <Menu.Item key="settings.tax-rates">
            <Link to="/settings/tax-rates">
              <CalculatorOutlined />
              <Trans>Tax rates</Trans>
            </Link>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    </Layout.Sider>
  );
};

export default connect(state => ({
  organizations: state.organizations,
}))(withRouter(Navigation));
