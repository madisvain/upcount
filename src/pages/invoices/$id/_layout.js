import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, FieldArray, formValueSelector, reduxForm } from 'redux-form';
import { Button, Col, Form, Icon, Row, Select } from 'antd';
import { forEach, map } from 'lodash';

import router from 'umi/router';
import currencyToSymbolMap from 'currency-symbol-map/map';

import LineItems from './_lines';
import { ADatePicker, AInput, ASelect, ATextarea } from '../../../components/fields';
import FooterToolbar from '../../../components/footer-toolbar';

class InvoiceForm extends Component {
  state = {
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0
  }

  clientSelect = (value) => {
    if (value === 'new') {
      router.push({
        pathname: '/invoices/new/client'
      })
    }
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.lineItems, prevProps.lineItems)
  }

  render() {
    const { children, lineItems, pristine, submitting } = this.props;
    const { subtotal, tax, discount, total } = this.state;

    return (
      <div style={{ paddingBottom: 60 }}>
        <Form>
          <Row gutter={16}>
            <Col span={12}>
              <Field
                showSearch
                name="client"
                placeholder="Select or create a client"
                component={ASelect}
                label="Client"
                onSelect={this.clientSelect}
              >
                <Select.Option value="new" key="new">
                  <Icon type="user-add" />
                  {` Create new client`}
                </Select.Option>
              </Field>
            </Col>
            <Col span={6}>
              <Field
                name="number"
                component={AInput}
                label="Invoice number"
              />
            </Col>
            <Col span={6}>
              <Field
                showSearch
                name="currency"
                component={ASelect}
                label="Currency"
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
              <Field name="date" component={ADatePicker} label="Date" style={{ width: '100%' }} />
            </Col>
            <Col span={6}>
              <Field
                name="due_date"
                component={ADatePicker}
                label="Due date"
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col>
              <FieldArray name="line_items" component={LineItems} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8} style={{ marginTop: '20px' }}>
              <Field
                name="customer_note"
                component={ATextarea}
                label="Customer note"
                rows={4}
              />
            </Col>
            <Col span={12} offset={4} style={{ marginTop: '20px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <th>Subtotal</th>
                    <td>{subtotal}</td>
                  </tr>
                  <tr>
                    <th>Tax</th>
                    <td>{tax}</td>
                  </tr>
                  <tr>
                    <th>Discount</th>
                    <td>{discount}</td>
                  </tr>
                  <tr>
                    <th>Total</th>
                    <td>{total}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>

          <FooterToolbar>
            <Button style={{ marginTop: '10px' }}>
              <Icon type="file-pdf" />
              Download PDF
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={pristine || submitting}
              loading={submitting}
              style={{ marginTop: '10px' }}
            >
              <Icon type="save" />
              Save invoice
            </Button>
          </FooterToolbar>
        </Form>

        {children}
      </div>
    )
  }
}

const selector = formValueSelector('invoice');

export default compose(
  connect(state => ({
    clients: state.clients,
    taxRates: state.taxRates,
    lineItems: selector(state, 'line_items'),
  })),
  reduxForm({
    form: 'invoice',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'invoices/save', data: data, resolve, reject });
      });
    },
  })
)(InvoiceForm);
