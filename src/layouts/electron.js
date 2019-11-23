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

    ipcRenderer.on('wrote-pdf', () => {
      router.push({
        pathname: '/',
      });
    });

    ipcRenderer.on('update_available', (event, data) => {
      notification.info({
        key: 'update_available',
        placement: 'topRight',
        duration: 0,
        message: 'Update Available',
        description: 'A new update is available. Downloading now...',
      });
    });

    ipcRenderer.on('update_downloaded', () => {
      notification.close('update_available');
      notification.info({
        placement: 'topRight',
        duration: 0,
        message: 'Update Downloaded',
        description: (
          <div>
            Update Downloaded. It will be installed on restart. Restart now?
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
