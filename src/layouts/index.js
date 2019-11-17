import { Component } from 'react';
import { Layout, notification, Button } from 'antd';

import Header from '../components/layout/header';
import Navigation from '../components/layout/navigation';

const { ipcRenderer } = window.require('electron')

class BaseLayout extends Component {
  state = {
    collapsed: false,
  };

  componentDidMount() {
    ipcRenderer.on("update_available", (event, data) => {
      notification.info({
        key: 'update_available',
        placement: "topRight",
        duration: 0,
        message: "Update Available",
        description: "A new update is available. Downloading now..."
      });
    });

    ipcRenderer.on('update_downloaded', () => {
      notification.close('update_available')
      notification.info({
        placement: "topRight",
        duration: 0,
        message: "Update Downloaded",
        description: (<div>
          Update Downloaded. It will be installed on restart. Restart now?
          <Button type="primary" style={{ float: 'right' }} onClick={this.restartApp}>Restart</Button>
          </div>)
      });
    });
  }

  restartApp = () => {
    ipcRenderer.send('restart_app')
  }

  toggleSider = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    const { children, location } = this.props;

    if (location.pathname === '/') {
      return <Layout style={{ minHeight: '100vh' }}>{children}</Layout>;
    } else {
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
}

export default BaseLayout;
