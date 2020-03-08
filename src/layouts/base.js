import { Component } from 'react';
import { Layout } from 'antd';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';

import Header from '../components/layout/header';
import Navigation from '../components/layout/navigation';

export const i18n = setupI18n();

class BaseLayout extends Component {
  state = {
    language: localStorage.getItem('language') || 'en',
    collapsed: false,
    catalogs: {},
  };

  componentDidMount() {
    this.loadLanguage(this.state.language);
  }

  loadLanguage = async language => {
    const catalogs = await import(`@lingui/loader!../locales/${language}/messages.po`);

    this.setState(state => ({
      catalogs: {
        ...state.catalogs,
        [language]: catalogs,
      },
    }));
  };

  toggleSider = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
    setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
  };

  render() {
    const { children, location } = this.props;
    const { catalogs, language } = this.state;

    if (location.pathname === '/') {
      return (
        <I18nProvider i18n={i18n} catalogs={catalogs} language={language}>
          <Layout style={{ minHeight: '100vh', margin: 0 }}>{children}</Layout>
        </I18nProvider>
      );
    } else if (location.pathname.includes('pdf')) {
      return (
        <I18nProvider i18n={i18n} catalogs={catalogs} language={language}>
          {children}
        </I18nProvider>
      );
    } else {
      return (
        <I18nProvider i18n={i18n} catalogs={catalogs} language={language}>
          <Layout style={{ minHeight: '100vh' }}>
            <Navigation collapsed={this.state.collapsed} />
            <Layout style={{ marginLeft: this.state.collapsed ? 80 : 200, transition: 'all 0.2s' }}>
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
