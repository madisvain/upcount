import { Component } from 'react';
import { connect } from 'dva';
import { Button, Icon, Spin } from 'antd';
import { get, has, head } from 'lodash';

import Link from 'umi/link';
import Frame from 'react-frame-component';

import FooterToolbar from '../../../components/layout/footer-toolbar';

class InvoicePreview extends Component {
  render() {
    const { clients, invoices } = this.props;
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));
    const client = invoice ? get(clients.items, invoice.client) : null;

    return (
      <div>
        {client && invoice ? (
          <Frame style={{ border: 'none', width: '100%', height: '100vh' }}>
            <h1>Invoice nr. {get(invoice, 'number')}</h1>
            <p style={{ whiteSpace: 'pre-line' }}>
              {get(client, 'name')}
              {has(client, 'address') ? (
                <span>
                  <br />
                  {get(client, 'address')}
                </span>
              ) : null}
              {has(client, 'emails') ? (
                <span>
                  <br />
                  <a href={`mailto:${head(get(client, 'emails', []))}`}>
                    {head(get(client, 'emails', []))}
                  </a>
                </span>
              ) : null}
              {has(client, 'website') ? (
                <span>
                  <br />
                  <a href={get(client, 'website')}>{get(client, 'website')}</a>
                </span>
              ) : null}
            </p>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <td>#</td>
                  <td>Description</td>
                  <td>Quantity</td>
                  <td>Price</td>
                  <td>Sum</td>
                </tr>
              </thead>
              <tbody>
                {get(invoice, 'lineItems', []).map((lineItem, index) => (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{lineItem.description}</td>
                    <td>{lineItem.quantity}</td>
                    <td>{lineItem.unitPrice}</td>
                    <td>{lineItem.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Frame>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Spin />
          </div>
        )}
        <FooterToolbar className="footer-toolbar">
          <Link to={`/invoices/${get(invoice, '_id')}`}>
            <Button type="dashed" style={{ marginTop: 10, marginRight: 8 }}>
              <Icon type="edit" />
              Edit
            </Button>
          </Link>
          <Button style={{ marginTop: 10 }} onClick={() => window.print()}>
            <Icon type="printer" />
            Print
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}

export default connect(state => {
  return {
    clients: state.clients,
    invoices: state.invoices,
  };
})(InvoicePreview);
