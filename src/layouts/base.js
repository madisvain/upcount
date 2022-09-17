import { Component } from 'react';
import { Layout } from 'antd';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import Header from '../components/layout/header';
import Navigation from '../components/layout/navigation';
import OrganizationProvider from '../providers/organization';
import { defaultLocale, dynamicActivate } from '../i18n';

// Base layout
class BaseLayout extends Component {
  constructor(props) {
    super();
    this.state = {
      collapsed: false,
      language: localStorage.getItem('language') || defaultLocale,
    };
    dynamicActivate(this.state.language);
  }

  setLanguage = async language => {
    dynamicActivate(language);
    this.setState({ language });
    localStorage.setItem('language', language);
  };

  toggleSider = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
  };

  render() {
    const { children, location } = this.props;

    if (location.pathname === '/') {
      return (
        <I18nProvider i18n={i18n}>
          <OrganizationProvider>
            <Layout style={{ minHeight: '100vh' }}>
              <Header
                backgroundColor={'#f0f2f5'}
                collapsible={false}
                organizationSelect={false}
                logo={true}
                setLanguage={this.setLanguage}
              />
              {children}
            </Layout>
          </OrganizationProvider>
        </I18nProvider>
      );
    } else if (location.pathname.includes('pdf')) {
      return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
    } else {
      return (
        <I18nProvider i18n={i18n}>
          <OrganizationProvider>
            <Layout style={{ minHeight: '100vh' }}>
              <Navigation collapsed={this.state.collapsed} />
              <Layout
                style={{ marginLeft: this.state.collapsed ? 80 : 200, transition: 'all 0.2s' }}
              >
                <Header
                  collapsed={this.state.collapsed}
                  onToggl={this.toggleSider}
                  setLanguage={this.setLanguage}
                />
                {children}
              </Layout>
            </Layout>
          </OrganizationProvider>
        </I18nProvider>
      );
    }
  }
}

export default BaseLayout;
