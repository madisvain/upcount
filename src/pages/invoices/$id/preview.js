import { Component } from 'react';
import { Button, Icon } from 'antd';
import { get } from 'lodash';

import Link from 'umi/link';

import FooterToolbar from '../../../components/layout/footer-toolbar';
import PDF from './pdf';

class InvoicePreview extends Component {
  printPDF = invoiceId => {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send('printInvoicePDF', invoiceId);
  };

  render() {
    return (
      <div>
        <PDF />

        <FooterToolbar className="footer-toolbar">
          <Link to={`/invoices/${get(this.props, ['match', 'params', 'id'])}`}>
            <Button type="dashed" style={{ marginTop: 10, marginRight: 8 }}>
              <Icon type="edit" />
              Edit
            </Button>
          </Link>
          <Button
            style={{ marginTop: 10 }}
            onClick={() => this.printPDF(get(this.props, ['match', 'params', 'id']))}
          >
            <Icon type="file-pdf" />
            PDF
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}

export default InvoicePreview;
