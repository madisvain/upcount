import { Component } from 'react';
import { Button, Icon } from 'antd';
import { StyleSheetManager } from 'styled-components';
import { get } from 'lodash';

import Frame, { FrameContextConsumer } from 'react-frame-component';
import Link from 'umi/link';

import FooterToolbar from '../../../components/layout/footer-toolbar';
import Invoice from './invoice';

/* Component */
class InvoicePreview extends Component {
  printPDF = invoiceId => {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send('printInvoicePDF', invoiceId);
  };

  render() {
    return (
      <div>
        <Frame
          id="invoice-frame"
          style={{ border: 'none', width: '100%', height: '100vh' }}
          head={
            <link
              rel="stylesheet"
              href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
              crossOrigin="anonymous"
            />
          }
        >
          <FrameContextConsumer>
            {frameContext => (
              <StyleSheetManager target={frameContext.document.head}>
                <Invoice />
              </StyleSheetManager>
            )}
          </FrameContextConsumer>
        </Frame>
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
