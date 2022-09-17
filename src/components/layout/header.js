import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { locales } from '../../i18n';
import { Layout, Menu, Dropdown } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { get, map, keys, upperCase } from 'lodash';

import Link from 'umi/link';

import { OrganizationContext } from '../../providers/contexts';

class Header extends Component {
  state = {
    accountDrawerVisible: false,
  };

  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
  }

  render() {
    const {
      backgroundColor,
      collapsible,
      i18n,
      organizationSelect,
      languageSelect,
      setLanguage,
      logo,
    } = this.props;

    return (
      <Layout.Header style={{ background: backgroundColor, padding: 0 }}>
        {collapsible
          ? React.createElement(this.props.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: this.props.onToggl,
              style: {
                marginTop: 24,
                padding: '0 24px',
                fontSize: 18,
                cursor: 'pointer',
                transition: 'color .3s',
              },
            })
          : null}
        {logo ? (
          <img
            src={require(`../../assets/logo-dark.svg`)}
            alt="Upcount"
            style={{ marginLeft: 24 }}
          />
        ) : null}
        {languageSelect ? (
          <Dropdown
            placement="bottom"
            overlay={
              <Menu>
                {map(keys(locales), locale => {
                  return (
                    <Menu.Item key={locale} onClick={() => setLanguage(locale)}>
                      {`${upperCase(locale)} - ${get(locales, locale)}`}
                    </Menu.Item>
                  );
                })}
              </Menu>
            }
            overlayStyle={{ width: 140 }}
          >
            <Link
              to="#"
              style={{ color: 'rgba(0, 0, 0, 0.65)', float: 'right', marginRight: 24 }}
              onClick={e => e.preventDefault()}
            >
              {upperCase(i18n.locale)} <DownOutlined />
            </Link>
          </Dropdown>
        ) : null}
        {organizationSelect ? (
          <OrganizationContext.Consumer>
            {context => (
              <Link
                to="/"
                style={{
                  float: 'right',
                  color: 'rgba(0, 0, 0, 0.65)',
                  fontSize: 15,
                  display: 'inline-block',
                  lineHeight: '64px',
                  marginRight: 24,
                }}
              >
                <SwapOutlined style={{ marginRight: 8 }} />
                {get(context.state, 'organization.name')}
              </Link>
            )}
          </OrganizationContext.Consumer>
        ) : null}
      </Layout.Header>
    );
  }
}

Header.defaultProps = {
  backgroundColor: '#fff',
  collapsible: true,
  organizationSelect: true,
  languageSelect: true,
  logo: false,
};

export default compose(
  withI18n(),
  connect(state => ({
    organizations: state.organizations,
  }))
)(Header);
