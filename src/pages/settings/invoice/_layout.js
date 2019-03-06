import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, Form, reduxForm } from 'redux-form';
import { Button, Col, Icon, Layout, Row, Select, Table, Upload } from 'antd';
import { map, values } from 'lodash';

import Link from 'umi/link';
import currencyToSymbolMap from 'currency-symbol-map/map';

import { AInput, APhoneInput, ASelect, ATextarea } from '../../../components/fields';

class Settings extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({ type: 'settings/initialize' });
  }

  render() {
    const { children, handleSubmit, pristine, submitting, taxRates } = this.props;

    return (
      <div>
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
                style={{ width: '100%' }}
              >
                {map(currencyToSymbolMap, (symbol, currency) => (
                  <Select.Option value={currency} key={currency}>
                    {`${currency} ${symbol}`}
                  </Select.Option>
                ))}
              </Field>
              <Field name="notes" component={ATextarea} label="Invoice notes" />
              <Button type="primary">Save</Button>
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
                <p>Click or drag logo to this area to upload</p>
              </Upload.Dragger>
            </Col>
          </Row>
        </Layout.Content>

        {children}
      </div>
    );
  }
}

export default compose(
  connect(state => ({})),
  reduxForm({
    form: 'settings',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'settings/save', data: data, resolve, reject });
      });
    },
  })
)(Settings);
