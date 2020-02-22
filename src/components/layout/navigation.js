import { useState, useEffect } from 'react';
import { Icon, Menu, Layout } from 'antd';

import Link from 'umi/link';
import withRouter from 'umi/withRouter';

const Navigation = props => {
  const [selectedMenuKeys, setSelectedMenueKeys] = useState(
    JSON.parse(localStorage.getItem('selectedMenuKeys')) || []
  );

  useEffect(() => {
    localStorage.setItem('selectedMenuKeys', JSON.stringify(selectedMenuKeys));
  });

  return (
    <Layout.Sider trigger={null} collapsible collapsed={props.collapsed}>
      <div className="logo" style={{ height: 22, margin: '21px 16px', textAlign: 'center' }}>
        <Link to="/invoices/">
          <img src={require(`../../assets/logo.svg`)} alt="Upcount" />
        </Link>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={selectedMenuKeys.selectedMenu}
        defaultOpenKeys={selectedMenuKeys.openSubMenu}
        onOpenChange={e =>
          setSelectedMenueKeys({
            selectedMenu: selectedMenuKeys.selectedMenu,
            openSubMenu: e,
          })
        }
        onSelect={e =>
          setSelectedMenueKeys({ selectedMenu: e.key, openSubMenu: selectedMenuKeys.openSubMenu })
        }
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
          // onOpenChange={e =>
          //   setSelectedMenueKeys({ openSubMenu: e, openMenu: selectedMenuKeys.openMenu })
          // }
          title={
            <span>
              <Icon type="setting" />
              <span>Settings</span>
            </span>
          }
        >
          <Menu.Item key="settings.organization">
            <Link to="/settings/organization">
              <Icon type="contacts" /> Organization
            </Link>
          </Menu.Item>
          <Menu.Item key="settings.invoice">
            <Link to="/settings/invoice">
              <Icon type="contacts" /> Invoice
            </Link>
          </Menu.Item>
          <Menu.Item key="settings.tax-rates">
            <Link to="/settings/tax-rates">
              <Icon type="calculator" /> Tax rates
            </Link>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    </Layout.Sider>
  );
};

export default withRouter(Navigation);
