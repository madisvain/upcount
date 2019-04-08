import { Component } from 'react';
import { Layout } from 'antd';

import Header from '../components/layout/header';
import Navigation from '../components/layout/navigation';

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
    const { children, location } = this.props;

    return (
      <Layout style={{ minHeight: '100vh' }}>
        {location.pathname !== '/' && <Navigation collapsed={this.state.collapsed} />}
        <Layout>
          {location.pathname !== '/' && (
            <Header collapsed={this.state.collapsed} onToggl={this.toggleSider} />
          )}
          {children}
        </Layout>
      </Layout>
    );
  }
}

export default BaseLayout;
