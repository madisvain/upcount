import { Component } from 'react';
import { Icon, Menu, Layout } from 'antd';

import Link from 'umi/link';

class Header extends Component {
  render() {
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
          Konstruktor OÜ
        </Link>
      </Layout.Header>
    );
  }
}

export default Header;
