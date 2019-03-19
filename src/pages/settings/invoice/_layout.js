import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, Form, Icon, Layout, Row, Select, Upload } from 'antd';
import { get, map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';

import { ASelect, ATextarea } from '../../../components/fields';

class Settings extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/initialize',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
  }

  handleLogoUpload = data => {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    this.props.dispatch({
      type: 'organizations/logo',
      payload: {
        _id: get(organization, '_id'),
        _rev: get(organization, '_rev'),
        file: get(data, 'file'),
      },
    });
  };

  render() {
    const { handleSubmit, pristine, submitting } = this.props;

    return (
      <div>
        <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <Icon type="file-text" />
                {` Invoice details`}
              </h2>
              <Form layout="vertical" onSubmit={handleSubmit}>
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
                <Field name="notes" component={ATextarea} label="Notes" rows={4} />
              </Form>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <h2>
                <Icon type="picture" />
                {` Logo`}
              </h2>
              <Upload.Dragger customRequest={data => this.handleLogoUpload(data)}>
                <p>
                  <Icon type="cloud-upload" style={{ fontSize: 32 }} />
                </p>
                <p>Click or drag logo to this area to upload</p>
              </Upload.Dragger>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                disabled={pristine || submitting}
                loading={submitting}
                style={{ marginTop: '10px' }}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Layout.Content>
      </div>
    );
  }
}

export default compose(
  connect(state => ({
    organizations: state.organizations,
  })),
  reduxForm({
    form: 'organization',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'organizations/save', data: data, resolve, reject });
      });
    },
  })
)(Settings);
