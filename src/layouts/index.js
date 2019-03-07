import { Component } from 'react';
import { Icon, Menu, Layout } from 'antd';
import { get, last } from 'lodash';
import pathToRegexp from 'path-to-regexp';

import Header from '../components/header';
import Navigation from '../components/navigation';

class BaseLayout extends Component {
  state = {
    collapsed: false,
  };

  toggleSider = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { children } = this.props;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Navigation collapsed={this.state.collapsed} />
        <Layout>
          <Header collapsed={this.state.collapsed} onToggl={this.toggleSider} />
          {children}
        </Layout>
      </Layout>
    );
  }
}

export default BaseLayout;
