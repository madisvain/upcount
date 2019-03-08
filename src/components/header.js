import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Icon, Layout } from 'antd';
import { get } from 'lodash';

import Link from 'umi/link';

class Header extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
  }

  render() {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage['organization']);

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
