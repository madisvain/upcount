import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { withI18n } from '@lingui/react';
import { Layout, Menu, Dropdown } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DownOutlined,
  SwapOutlined,
} from '@ant-design/icons';

import { get, map, upperCase } from 'lodash';

import Link from 'umi/link';

const languages = ['en', 'et', 'de'];

class Header extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
  }

  setLanguage = language => {
    localStorage.setItem('language', language);
    window.location.reload();
  };

  render() {
    const { i18n, organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    return (
      <Layout.Header style={{ background: '#fff', padding: 0 }}>
        {React.createElement(this.props.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
          className: 'trigger',
          onClick: this.props.onToggl,
          style: {
            padding: '0 24px',
            fontSize: 18,
            cursor: 'pointer',
            transition: 'color .3s',
          },
        })}
        <Dropdown
          placement="bottomCenter"
          overlay={
            <Menu>
              {map(languages, language => {
                return (
                  <Menu.Item key={language} onClick={() => this.setLanguage(language)}>
                    {upperCase(language)}
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          <Link
            to="#"
            style={{ color: 'rgba(0, 0, 0, 0.65)', float: 'right', marginRight: 24 }}
            onClick={e => e.preventDefault()}
          >
            {upperCase(i18n.language)} <DownOutlined />
          </Link>
        </Dropdown>
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
          {get(organization, 'name')}
        </Link>
      </Layout.Header>
    );
  }
}

export default compose(
  withI18n(),
  connect(state => ({
    organizations: state.organizations,
  }))
)(Header);
