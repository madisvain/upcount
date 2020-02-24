import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Icon, Layout, Menu, Dropdown } from 'antd';
import { get, map, upperCase } from 'lodash';

import Link from 'umi/link';

import { i18n } from '../../layouts/base';

const languages = ['en', 'et'];

class Header extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
  }

  setLanguage = language => {
    localStorage.setItem('language', language);
    window.location.reload();
  };

  render() {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    return (
      <Layout.Header style={{ background: '#fff', padding: 0 }}>
        <Icon
          className="trigger"
          type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.props.onToggl}
          style={{
            padding: '0 24px',
            fontSize: 18,
            cursor: 'pointer',
            transition: 'color .3s',
          }}
        />
        <Dropdown
          placement="bottomCenter"
          overlay={
            <Menu>
              {map(languages, language => {
                return (
                  <Menu.Item key={language}>
                    <a
                      rel="noopener noreferrer"
                      href="#"
                      onClick={() => this.setLanguage(language)}
                    >
                      {upperCase(language)}
                    </a>
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          <a
            href="/#"
            style={{ color: 'rgba(0, 0, 0, 0.65)', float: 'right', marginRight: 24 }}
            onClick={e => e.preventDefault()}
          >
            {upperCase(i18n.language)} <Icon type="down" />
          </a>
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
          <Icon type="swap" style={{ marginRight: 8 }} />
          {get(organization, 'name')}
        </Link>
      </Layout.Header>
    );
  }
}

export default compose(
  connect(state => ({
    organizations: state.organizations,
  }))
)(Header);
