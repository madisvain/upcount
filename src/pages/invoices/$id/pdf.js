import { Component } from 'react';
import { StyleSheetManager } from 'styled-components';

import Frame, { FrameContextConsumer } from 'react-frame-component';

import Invoice from './invoice';

/* Component */
class InvoicePdf extends Component {
  componentDidMount() {
    const { ipcRenderer } = window.require('electron');

    setTimeout(() => ipcRenderer.send('readyToPrint'), 300);
  }

  render() {
    return (
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
    );
  }
}

export default InvoicePdf;
