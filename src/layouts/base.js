import { Component } from 'react';
import { Layout } from 'antd';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import Header from '../components/layout/header';
import Navigation from '../components/layout/navigation';

const language = localStorage.getItem('language') || 'en';
export const i18n = setupI18n({ language: language });

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

    if (location.pathname === '/') {
      return (
        <I18nProvider i18n={i18n} language="en">
          <Layout style={{ minHeight: '100vh', margin: 0 }}>{children}</Layout>
        </I18nProvider>
      );
    } else if (location.pathname.includes('pdf')) {
      return (
        <I18nProvider i18n={i18n} language="en">
          {children}
        </I18nProvider>
      );
    } else {
      return (
        <I18nProvider i18n={i18n} language="en">
          <Layout style={{ minHeight: '100vh' }}>
            <Navigation collapsed={this.state.collapsed} />
            <Layout>
              <Header collapsed={this.state.collapsed} onToggl={this.toggleSider} />
              {children}
            </Layout>
          </Layout>
        </I18nProvider>
      );
    }
  }
}

export default BaseLayout;
