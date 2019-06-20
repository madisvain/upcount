import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, Form, Icon, Layout, Row, Select, Upload } from 'antd';
import { get, map } from 'lodash';

import currencyToSymbolMap from 'currency-symbol-map/map';

import { ASelect, ATextarea } from '../../../components/forms/fields';

class Settings extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({
      type: 'organizations/initialize',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
    this.props.dispatch({
      type: 'organizations/getLogo',
      payload: {
        id: localStorage.getItem('organization'),
      },
    });
  }

  handleLogoUpload = data => {
    const { organizations } = this.props;
    const organization = get(organizations.items, localStorage.getItem('organization'));

    this.props.dispatch({
      type: 'organizations/setLogo',
      payload: {
        _id: get(organization, '_id'),
        _rev: get(organization, '_rev'),
        file: get(data, 'file'),
      },
    });
  };

  render() {
    const { handleSubmit, pristine, submitting, organizations } = this.props;
    const logo = get(organizations.logos, localStorage.getItem('organization'));

    return (
      <Layout.Content style={{ margin: 16, padding: 24, background: '#fff' }}>
        <Form layout="vertical" onSubmit={handleSubmit}>
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
              <Field name="notes" component={ATextarea} label="Notes" rows={4} />
            </Col>
          </Row>
          <Row>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                disabled={pristine || submitting}
                loading={submitting}
                style={{ marginBottom: 40 }}
              >
                Save
              </Button>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col span={12}>
            <h2>
              <Icon type="picture" />
              {` Logo`}
            </h2>
            {logo ? <img src={logo} alt="logo" style={{ maxWidth: 250, maxHeight: 250 }} /> : ''}
            <br />
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={data => this.handleLogoUpload(data)}
            >
              <Button style={{ marginTop: 20 }}>
                <Icon type="upload" /> {logo ? 'Change' : 'Upload'}
              </Button>
            </Upload>
          </Col>
        </Row>
      </Layout.Content>
    );
  }
}

export default compose(
  connect(state => ({
    organizations: state.organizations,
  })),
  reduxForm({
    form: 'organization',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'organizations/save', data: data });
    },
    onSubmitSuccess: (result, dispatch) => {
      dispatch({
        type: 'organizations/initialize',
        payload: {
          id: localStorage.getItem('organization'),
        },
      });
    },
  })
)(Settings);
