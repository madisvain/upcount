import { notification, Button } from 'antd';
import router from 'umi/router';

import BaseLayout from './base';

class ElectronLayout extends BaseLayout {
  componentDidMount() {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.on('log', (event, log) => {
      console.log('log', log);
    });

    ipcRenderer.on('printInvoicePDF', (event, id) => {
      router.push({
        pathname: `/invoices/${id}/pdf`,
      });
    });

    ipcRenderer.on('wrotePDF', () => {
      router.push({
        pathname: '/',
      });
    });

    ipcRenderer.on('updateAvailable', (event, data) => {
      notification.info({
        placement: 'bottomRight',
        duration: 10,
        message: 'Update Available',
        description: 'A new version of Upcount is available. Downloading now ...',
      });
    });

    ipcRenderer.on('updateDownloaded', () => {
      notification.success({
        placement: 'bottomRight',
        duration: 0,
        message: 'Update Downloaded',
        description: (
          <div>
            Upcount version update downloaded. It will be installed after restarting. Restart now?
            <Button type="primary" style={{ float: 'right' }} onClick={this.restartApp}>
              Restart
            </Button>
          </div>
        ),
      });
    });
  }

  restartApp = () => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.send('restart_app');
  };
}

export default ElectronLayout;
