import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, FieldArray, reduxForm } from 'redux-form';
import { Col, Form, Row, Select } from 'antd';
import { map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';

import LineItems from './components/lines';
import { ADatePicker, AInput, ASelect, ATextarea } from '../../components/fields';

class InvoiceForm extends Component {
  render() {
    return (
      <div>
        <Form>
          <Row gutter={16}>
            <Col span={12}>
              <Field
                name="number"
                component={ASelect}
                label="Client"
              />
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
              <Field name="date" component={ADatePicker} label="Date" />
            </Col>
            <Col span={6}>
              <Field
                name="due_date"
                component={ADatePicker}
                label="Due date"
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col>
              <FieldArray name="line_items" component={LineItems} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={7} style={{ marginTop: '20px' }}>
              <Field
                name="customer_note"
                component={ATextarea}
                label="Customer note"
                rows={4}
              />
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}

export default compose(
  reduxForm({
    form: 'invoice',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'invoices/save', data: data, resolve, reject });
      });
    },
  })
)(InvoiceForm);
