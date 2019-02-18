import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, Form, reduxForm } from 'redux-form';
import { Button, Col, Icon, Layout, Row, Select, Table, Upload } from 'antd';
import { map } from 'lodash';

import Link from 'umi/link';
import currencyToSymbolMap from 'currency-symbol-map/map';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../components/fields';

class Settings extends Component {
  render() {
    const { handleSubmit, taxRates } = this.props;

    return (
      <div>
        <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <Icon type="home" />
                {` Company details`}
              </h2>
              <Form layout="vertical" onSubmit={handleSubmit}>
                <Field
                  name="name"
                  component={AInput}
                  label="Company name"
                />
                <Field
                  name="address"
                  component={ATextarea}
                  label="Address"
                />
                <Field
                  name="email"
                  component={AInput}
                  label="Email"
                />
                <Field
                  name="phone"
                  component={APhoneInput}
                  label="Phone"
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <Field
                      name="vatin"
                      component={AInput}
                      label="VATIN"
                    />
                  </Col>
                  <Col span={12}>
                    <Field
                      name="website"
                      component={AInput}
                      label="Website"
                    />
                  </Col>
                </Row>
              </Form>
              <Button type="primary">
                Save
              </Button>
            </Col>
          </Row>
        </Layout.Content>

        <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <Icon type="file-text" />
                {` Invoice details`}
              </h2>
              <Field
                  showSearch
                  name="currency"
                  component={ASelect}
                  label="Default currency"
                  style={{ width:  '100%' }}
                >
                  {map(currencyToSymbolMap, (symbol, currency) => (
                    <Select.Option value={currency} key={currency}>
                      {`${currency} ${symbol}`}
                    </Select.Option>
                  ))}
                </Field>
              <Field
                name="notes"
                component={ATextarea}
                label="Invoice notes"
              />
              <Button type="primary">
                Save
              </Button>
            </Col>
            <Col span={12}>
              <h2>
                <Icon type="picture" />
                {` Company logo`}
              </h2>
              <Upload.Dragger>
                <p>
                  <Icon type="cloud-upload" style={{ fontSize: 32 }} />
                </p>
                <p>
                  Click or drag logo to this area to upload
                </p>
              </Upload.Dragger>
            </Col>
          </Row>
        </Layout.Content>

        <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
          <Row>
            <Col>
              <h2>
                <Icon type="calculator" />
                {` Tax rates`}
                <Link to="/settings/taxes/new">
                  <Button type="primary" style={{ float: 'right' }}>
                    New tax
                  </Button>
                </Link>
              </h2>
              <Table
                dataSource={taxRates.items}
                pagination={false}
                loading={taxRates.loading}
                rowKey="id"
                size="middle"
                bordered
              >
                <Table.Column title="Name" dataIndex="name" key="name" />
                <Table.Column
                  title="Description"
                  dataIndex="description"
                  key="description"
                />
                <Table.Column
                  title="Percentage"
                  dataIndex="percentage"
                  className="text-right"
                  key="percentage"
                  render={percentage => `${percentage} %`}
                />
              </Table>
            </Col>
          </Row>
        </Layout.Content>
      </div>
    )
  }
}

export default compose(
  connect(state => ({
    taxRates: state.taxRates
  })),
  reduxForm({
    form: 'settings',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'settings/save', data: data, resolve, reject });
      });
    },
  })
)(Settings);
