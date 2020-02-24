import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Spin } from 'antd';
import { Trans } from '@lingui/macro';
import { get, has, head } from 'lodash';

import getSymbolFromCurrency from 'currency-symbol-map';
import styled from 'styled-components';
import withRouter from 'umi/withRouter';

const Page = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700&subset=latin-ext');
  font-family: 'Open Sans', sans-serif;

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
    width: calc(100% - 48px);
    position: absolute;
    bottom: 24px;
    border-top: 1px solid #000;
    padding-top: 10px;
    font-size: 11px;

    @media print {
      width: 100%;
      position: fixed;
      bottom: 0;
      border-top: 1px solid #868686;
    }
  }
`;

class Invoice extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'organizations/list' });
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/getLogo',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });

    if (get(this.props, ['match', 'path'], '').endsWith('pdf')) {
      const { ipcRenderer } = window.require('electron');
      setTimeout(() => ipcRenderer.send('readyToPrint'), 300);
    }
  }

  render() {
    const { clients, organizations, invoices } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));
    const logo = get(organizations.logos, localStorage.getItem('organization'));
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));
    const client = invoice ? get(clients.items, invoice.client) : null;

    return (
      <Page id="bootstrapped">
        {client && organization && invoice ? (
          <div className="container">
            <div className="row">
              <div className="col">
                <h1 id="number">
                  <Trans>Invoice</Trans> #{get(invoice, 'number')}
                </h1>
              </div>
              <div className="col text-right">
                {logo ? (
                  <img id="logo" src={logo} alt="logo" style={{ maxWidth: 250, maxHeight: 250 }} />
                ) : null}
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
                    <a href={get(organization, 'website')}>{get(organization, 'website')}</a>
                  </span>
                ) : null}
              </div>
            </div>
            <div className="row">
              <div className="col-4">
                <table id="dates" className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td>
                        <Trans>Date</Trans>
                      </td>
                      <td>{invoice.date}</td>
                    </tr>
                    {invoice.due_date ? (
                      <tr>
                        <td>
                          <Trans>Due date</Trans>
                        </td>
                        <td>{invoice.due_date}</td>
                      </tr>
                    ) : null}
                    {invoice.overdue_charge ? (
                      <tr>
                        <td>
                          <Trans>Overdue charge</Trans>
                        </td>
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
                      <td className="border-top-0">
                        <Trans>Description</Trans>
                      </td>
                      <td className="border-top-0 min-width">
                        <Trans>Quantity</Trans>
                      </td>
                      <td className="border-top-0 min-width spaced text-right">
                        <Trans>Price</Trans>
                      </td>
                      <td className="border-top-0 min-width spaced text-right">
                        <Trans>Sum</Trans>
                      </td>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                      <td colSpan="2" />
                      <td colSpan="2">
                        <Trans>Subtotal</Trans>
                      </td>
                      <td className="text-right">
                        {invoice.subTotal}
                        {getSymbolFromCurrency(invoice.currency)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="border-top-0" />
                      <td colSpan="2" className="border-top-0">
                        Tax
                      </td>
                      <td className="text-right border-top-0">
                        {invoice.taxTotal}
                        {getSymbolFromCurrency(invoice.currency)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="border-top-0" />
                      <td colSpan="2">
                        <strong>
                          <Trans>Total</Trans>
                        </strong>
                      </td>
                      <td className="text-right">
                        <strong>
                          {invoice.total}
                          {getSymbolFromCurrency(invoice.currency)}
                        </strong>
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
            <div id="footer" className="row">
              <div className="col">
                {get(organization, 'bank')} {get(organization, 'iban')}
              </div>
              {organization.registration_number ? (
                <div className="col text-center">
                  <Trans>Reg. nr.</Trans> {get(organization, 'registration_number')}
                </div>
              ) : null}
              {organization.vatin ? (
                <div className="col text-right">
                  <Trans>VAT IN</Trans> {get(organization, 'vatin')}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <Spin />
          </div>
        )}
      </Page>
    );
  }
}

export default withRouter(
  compose(
    connect(state => {
      return {
        clients: state.clients,
        organizations: state.organizations,
        invoices: state.invoices,
      };
    })(Invoice)
  )
);
