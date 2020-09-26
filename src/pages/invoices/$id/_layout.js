import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, FieldArray, formValueSelector, reduxForm } from 'redux-form';
import { Button, Col, Form, Layout, Row, Select, Menu, Dropdown, Modal } from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { forEach, get, isString, includes, has, lowerCase, map } from 'lodash';

import moment from 'moment';
import Link from 'umi/link';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import currency from 'currency.js';
import currencyToSymbolMap from 'currency-symbol-map/map';

import { AInput, ASelect, ATextarea, ADatePicker } from '../../../components/forms/fields';
import { required } from '../../../components/forms/validators';
import StateTag from '../../../components/invoices/state-tag';
import LineItems from '../../../components/invoices/line-items';
import FooterToolbar from '../../../components/layout/footer-toolbar';
import * as util from '@/util';

const totals = (lineItems, taxRates) => {
  let subTotal = currency(0, { separator: '' });
  let taxTotal = currency(0, { separator: '' });

  forEach(lineItems, line => {
    if (has(line, 'subtotal')) {
      subTotal = subTotal.add(line.subtotal);
      if (has(line, 'taxRate')) {
        const taxRate = get(taxRates.items, line.taxRate);
        if (taxRate) {
          const lineTax = currency(line.subtotal).multiply(taxRate.percentage / 100);
          taxTotal = taxTotal.add(lineTax);
        }
      }
    }
  });

  const total = subTotal.add(taxTotal);
  return { subTotal, taxTotal, total };
};

class InvoiceForm extends Component {
  componentDidMount() {
    if (!this.isNew()) {
      this.props.dispatch({
        type: 'invoices/initialize',
        payload: {
          id: get(this.props, ['match', 'params', 'id']),
        },
      });
    }
    this.props.dispatch({ type: 'clients/list' });
    this.props.dispatch({ type: 'taxRates/list' });
  }

  isNew = () => {
    const {
      match: { params },
    } = this.props;

    return has(params, 'id') && params['id'] === 'new';
  };

  clientSelect = value => {
    if (value === 'new') {
      const {
        match: { params },
      } = this.props;

      router.push({
        pathname: `/invoices/${get(params, 'id', 'new')}/client`,
      });
    }
  };

  onStateSelect = (_id, _rev, key) => {
    this.props.dispatch({
      type: 'invoices/state',
      payload: {
        _id,
        _rev,
        state: key,
      },
    });
  };

  deleteConfirm = (_id, _rev) => {
    Modal.confirm({
      title: 'Are you sure delete this invoice?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.props.dispatch({
          type: 'invoices/remove',
          data: {
            _id,
            _rev,
          },
        });
      },
    });
  };

  printPDF = invoiceId => {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send('printInvoicePDF', invoiceId);
  };

  render() {
    const {
      i18n,
      invoices,
      location,
      children,
      clients,
      handleSubmit,
      lineItems,
      pristine,
      submitting,
      taxRates,
      organizations
    } = this.props;
    const { subTotal, taxTotal, total } = totals(lineItems, taxRates);
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));
    const organization = get(organizations.items, localStorage.getItem('organization'));

    const stateMenu = (_id, _rev) => (
      <Menu onClick={({ item, key }) => this.onStateSelect(_id, _rev, key)}>
        <Menu.Item key="draft">
          <Trans>Draft</Trans>
        </Menu.Item>
        <Menu.Item key="confirmed">
          <Trans>Confirmed</Trans>
        </Menu.Item>
        <Menu.Item key="paid">
          <Trans>Paid</Trans>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="void">
          <Trans>Void</Trans>
        </Menu.Item>
      </Menu>
    );

    // Invoice PDF
    if (get(location, 'pathname', '').endsWith('pdf')) {
      return children;
    }

    // Invoice Preview
    if (get(location, 'pathname', '').endsWith('preview')) {
      return (
        <Layout.Content
          className="has-toolbar"
          style={{
            width: '21cm',
            minHeight: '29.7cm',
            margin: '16px auto 72px auto',
            position: 'relative',
            boxShadow: '0 0 0.2cm rgba(0,0,0,0.1)',
          }}
        >
          {children}
        </Layout.Content>
      );
    }

    // Invoice form
    return (
      <Layout.Content className="has-toolbar">
        <Form onFinish={() => handleSubmit()} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Field
                showSearch
                name="client"
                placeholder={i18n._(t`Select or create a client`)}
                component={ASelect}
                label={<Trans>Client</Trans>}
                onSelect={this.clientSelect}
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const clientName = get(option, ['props', 'children']);
                  if (isString(clientName)) {
                    return includes(lowerCase(clientName), lowerCase(input));
                  }
                  return true;
                }}
                validate={[required]}
              >
                {map(clients.items, (client, id) => (
                  <Select.Option value={id} key={id}>
                    {get(client, 'name', '-')}
                  </Select.Option>
                ))}
                <Select.Option value="new" key="new" style={{ borderTop: '1px solid #e8e8e8' }}>
                  <UserAddOutlined />
                  {` `}
                  <Trans>Create new client</Trans>
                </Select.Option>
              </Field>
            </Col>
            <Col span={6}>
              <Field
                name="number"
                component={AInput}
                label={<Trans>Invoice number</Trans>}
                validate={[required]}
              />
            </Col>
            <Col span={6}>
              <Field
                showSearch
                name="currency"
                component={ASelect}
                label={<Trans>Currency</Trans>}
                validate={[required]}
              >
                {map(currencyToSymbolMap, (symbol, currency) => (
                  <Select.Option value={currency} key={currency}>
                    {`${currency} ${symbol}`}
                  </Select.Option>
                ))}
              </Field>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6} offset={12}>
              <Field
                name="date"
                component={ADatePicker}
                props={{ format: util.getDatePickerFormats() }}
                label={<Trans>Date</Trans>}
                style={{ width: '100%' }}
                validate={[required]}
              />
            </Col>
            <Col span={6}>
              <Field
                name="due_date"
                component={ADatePicker}
                props={{ format: util.getDatePickerFormats() }}
                label={<Trans>Due date</Trans>}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col span={24}>
              <FieldArray name="lineItems" component={LineItems} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8} style={{ marginTop: '20px' }}>
              <Field
                name="customer_note"
                component={ATextarea}
                label={<Trans>Customer note</Trans>}
                rows={4}
              />
            </Col>
            <Col span={12} offset={4} style={{ marginTop: '31px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'right', width: '50%' }}>
                      <h4>
                        <Trans>Subtotal</Trans>
                      </h4>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <h4>{subTotal.format()}</h4>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'right' }}>
                      <Trans>Tax</Trans>
                    </td>
                    <td style={{ textAlign: 'right' }}>{taxTotal.format()}</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'right', paddingTop: 24 }}>
                      <h2>
                        <Trans>Total</Trans>
                      </h2>
                    </td>
                    <td style={{ textAlign: 'right', paddingTop: 24 }}>
                      <h2>{total.format()}</h2>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>

          <FooterToolbar
            extra={
              <div>
                {!this.isNew() && (
                  <Button
                    type="dashed"
                    onClick={() => this.deleteConfirm(invoice._id, invoice._rev)}
                  >
                    <DeleteOutlined /> <Trans>Delete</Trans>
                  </Button>
                )}
              </div>
            }
          >
            {!this.isNew() && invoice && (
              <Dropdown overlay={stateMenu(invoice._id, invoice._rev)} trigger={['click']}>
                <StateTag state={invoice.state} style={{ marginTop: 10, marginRight: 20 }} />
              </Dropdown>
            )}
            {!this.isNew() && (
              <Link to={`/invoices/${get(this.props, ['match', 'params', 'id'])}/preview`}>
                <Button type="dashed" style={{ marginTop: 10, marginRight: 8 }}>
                  <EyeOutlined /> <Trans>View</Trans>
                </Button>
              </Link>
            )}
            {!this.isNew() && (
              <Button
                style={{ marginTop: 10 }}
                onClick={() => this.printPDF(get(this.props, ['match', 'params', 'id']))}
              >
                <FilePdfOutlined /> <Trans>PDF</Trans>
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              disabled={pristine || submitting}
              loading={submitting}
              style={{ marginTop: 10 }}
            >
              <SaveOutlined /> <Trans>Save</Trans>
            </Button>
          </FooterToolbar>
        </Form>

        {children}
      </Layout.Content>
    );
  }
}

const selector = formValueSelector('invoice');

export default withI18n()(
  withRouter(
    compose(
      connect(state => ({
        invoices: state.invoices,
        clients: state.clients,
        taxRates: state.taxRates,
        lineItems: selector(state, 'lineItems'),
        organizations: state.organizations,
        initialValues: {
          currency: get(
            state.organizations.items,
            [localStorage.getItem('organization'), 'currency'],
            ''
          ),
          date: moment().format('YYYY-MM-DD'),
          due_date: moment()
            .add(
              get(state.organizations.items, [localStorage.getItem('organization'), 'due_days'], 0),
              'days'
            )
            .format('YYYY-MM-DD'),
          customer_note: get(
            state.organizations.items,
            [localStorage.getItem('organization'), 'notes'],
            ''
          ),
          lineItems: [{}],
        },
      }))(
        reduxForm({
          form: 'invoice',
          onSubmit: async (data, dispatch, props) => {
            const { lineItems, taxRates } = props;
            const { subTotal, taxTotal, total } = totals(lineItems, taxRates);
            return await dispatch({
              type: 'invoices/save',
              data: {
                ...data,
                subTotal: subTotal.format(),
                taxTotal: taxTotal.format(),
                total: total.format(),
              },
            });
          },
          onSubmitSuccess: (result, dispatch, props) => {
            router.push({
              pathname: '/invoices/',
            });
          },
        })(InvoiceForm)
      )
    )
  )
);
