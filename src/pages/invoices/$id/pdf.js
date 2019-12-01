import { Component } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import { get, has, head } from 'lodash';

import getSymbolFromCurrency from 'currency-symbol-map';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import styled, { StyleSheetManager } from 'styled-components';

/* Styles */
const Invoice = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700&subset=latin-ext');
  font-family: 'Open Sans', sans-serif;
  width: 700px;
  height: 800px;

  .line-break {
    white-space: pre-line;
  }

  #client,
  #organization {
    margin-top: 20px;
    strong {
      display: inline-block;
      padding-bottom: 10px;
    }
  }

  #dates {
    margin-top: 20px;

    tbody {
      tr {
        td {
          padding-bottom: 0;
        }
        td:first-of-type {
          padding-left: 0;
        }
      }
    }
  }

  #lines {
    margin-top: 40px;

    table {
      td {
        border-top: 3px solid #868686;
        &.min-width {
          width: 1%;
          white-space: nowrap;
        }
        &.spaced {
          padding-left: 20px;
        }
      }
    }
  }

  #notes {
    margin-top: 40px;
  }

  #footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    font-size: 11px;
  }
`;

/* Component */
class InvoicePreview extends Component {
  componentDidMount() {
    const { ipcRenderer } = window.require('electron');

    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/getLogo',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });

    setTimeout(() => ipcRenderer.send('readyToPrint'), 300);
  }

  render() {
    const { clients, organizations, invoices } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));
    const logo = get(organizations.logos, localStorage.getItem('organization'));
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));
    const client = invoice ? get(clients.items, invoice.client) : null;

    return (
      <div>
        {client && organization && invoice ? (
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
                  <Invoice>
                    <div>
                      <div className="row">
                        <div className="col">
                          <h1 id="number">Invoice #{get(invoice, 'number')}</h1>
                        </div>
                        <div className="col text-right">
                          <img
                            id="logo"
                            src={logo}
                            alt="logo"
                            style={{ maxWidth: 250, maxHeight: 250 }}
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div id="client" className="col line-break">
                          <strong>{get(client, 'name')}</strong>
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
                        </div>
                        <div id="organization" className="col line-break text-right">
                          <strong>{get(organization, 'name')}</strong>
                          {has(organization, 'address') ? (
                            <span>
                              <br />
                              {get(organization, 'address')}
                            </span>
                          ) : null}
                          {has(organization, 'email') ? (
                            <span>
                              <br />
                              <a href={`mailto:${get(organization, 'email')}`}>
                                {get(organization, 'email')}
                              </a>
                            </span>
                          ) : null}
                          {has(organization, 'website') ? (
                            <span>
                              <br />
                              <a href={get(organization, 'website')}>
                                {get(organization, 'website')}
                              </a>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-4">
                          <table id="dates" className="table table-sm table-borderless">
                            <tbody>
                              <tr>
                                <td>Date</td>
                                <td>{invoice.date}</td>
                              </tr>
                              {invoice.due_date ? (
                                <tr>
                                  <td>Due date</td>
                                  <td>{invoice.due_date}</td>
                                </tr>
                              ) : null}
                              {invoice.overdue_charge ? (
                                <tr>
                                  <td>Overdue charge</td>
                                  <td>{invoice.overdue_charge}</td>
                                </tr>
                              ) : null}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div id="lines" className="row">
                        <div className="col">
                          <table className="table">
                            <thead>
                              <tr>
                                <td className="border-top-0 min-width text-center">#</td>
                                <td className="border-top-0">Description</td>
                                <td className="border-top-0 min-width">Quantity</td>
                                <td className="border-top-0 min-width spaced text-right">Price</td>
                                <td className="border-top-0 min-width spaced text-right">Sum</td>
                              </tr>
                            </thead>
                            <tfoot>
                              <tr>
                                <td colSpan="2" />
                                <td colSpan="2">Subtotal</td>
                                <td className="text-right">
                                  {invoice.subTotal}
                                  {invoice.currency}
                                </td>
                              </tr>
                              <tr>
                                <td colSpan="2" className="border-top-0" />
                                <td colSpan="2" className="border-top-0">
                                  Tax
                                </td>
                                <td className="text-right border-top-0">
                                  {invoice.tax}
                                  {getSymbolFromCurrency(invoice.currency)}
                                </td>
                              </tr>
                              <tr>
                                <td colSpan="2" className="border-top-0" />
                                <td colSpan="2">Total</td>
                                <td className="text-right">
                                  {invoice.total}
                                  {getSymbolFromCurrency(invoice.currency)}
                                </td>
                              </tr>
                            </tfoot>
                            <tbody>
                              {get(invoice, 'lineItems', []).map((lineItem, index) => (
                                <tr key={`lineItem-${index}`}>
                                  <td>{index + 1}</td>
                                  <td>{lineItem.description}</td>
                                  <td className="min-width">{lineItem.quantity}</td>
                                  <td className="min-width spaced text-right">
                                    {lineItem.unitPrice}
                                    {getSymbolFromCurrency(invoice.currency)}
                                  </td>
                                  <td className="min-width spaced text-right">
                                    {lineItem.subtotal}
                                    {getSymbolFromCurrency(invoice.currency)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div id="notes" className="row">
                        <div className="col line-break">{invoice.customer_note}</div>
                      </div>
                      <div>
                        <table className="table">
                          <thead>
                            <tr>
                              <td>
                                {get(organization, 'bank')} {get(organization, 'iban')}
                              </td>
                              <td className="text-center">
                                Reg. nr. {get(organization, 'registration_number')}
                              </td>
                              <td className="text-right">VAT IN {get(organization, 'vatin')}</td>
                            </tr>
                          </thead>
                        </table>
                      </div>
                    </div>
                  </Invoice>
                </StyleSheetManager>
              )}
            </FrameContextConsumer>
          </Frame>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Spin />
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => {
  return {
    clients: state.clients,
    organizations: state.organizations,
    invoices: state.invoices,
  };
})(InvoicePreview);
