import { Component } from 'react';
import { compose } from 'redux';
import { Field, FieldArray, reduxForm } from 'redux-form';
import { Button, Col, Form, Icon, Row, Select, Statistic, Table } from 'antd';
import { map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';

import LineItems from './components/lines';
import { ADatePicker, AInput, ASelect, ATextarea } from '../../components/fields';
import FooterToolbar from '../../components/footer-toolbar';

class InvoiceForm extends Component {
  render() {
    const { handleSubmit, pristine, submitting } = this.props;
    const totals = [{
      'title': 'Subtotal',
      'value': 100
    },{
      'title': 'Tax',
      'value': 20
    },{
      'title': 'Discount',
      'value': 0
    },{
      'title': 'Total',
      'value': 120
    }]

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
              <Table dataSource={totals} showHeader={false} pagination={false} size="small" bordered={false}>
                <Table.Column
                  dataIndex="title"
                  key="title"
                />
                <Table.Column
                  dataIndex="value"
                  key="value"
                  render={value => (<Statistic value={value} precision={2} />)}
                />
              </Table>
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
