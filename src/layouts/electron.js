import { notification, Button } from 'antd';
import { i18n } from '@lingui/core';
import { t, Trans } from '@lingui/macro';
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
        message: i18n._(t`Update Available`),
        description: i18n._(t`A new version of Upcount is available. Downloading now ...`),
      });
    });

    ipcRenderer.on('updateDownloaded', () => {
      notification.success({
        placement: 'bottomRight',
        duration: 0,
        message: i18n._(t`Update Downloaded`),
        description: (
          <div>
            <Trans>
              Upcount version update downloaded. It will be installed after a restart. Restart now?
            </Trans>
            <Button type="primary" style={{ float: 'right' }} onClick={this.restartApp}>
              <Trans>Restart</Trans>
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
