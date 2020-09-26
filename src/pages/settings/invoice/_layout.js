import React, { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Field, reduxForm } from 'redux-form';
import { Button, Col, Form, Layout, Row, Select, Upload } from 'antd';
import { FileTextOutlined, PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { get, map } from 'lodash';
import moment from 'moment/min/moment-with-locales';

import currencyToSymbolMap from 'currency-symbol-map/map';

import { AInput, AInputNumber, ASelect, ATextarea } from '../../../components/forms/fields';
import * as util from '@/util';

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
      <Layout.Content>
        <Form layout="vertical" onFinish={() => handleSubmit()}>
          <Row gutter={32}>
            <Col span={12}>
              <h2>
                <FileTextOutlined />
                {` `}
                <Trans>Invoice details</Trans>
              </h2>
              <Field
                showSearch
                name="currency"
                component={ASelect}
                label={<Trans>Default currency</Trans>}
                style={{ width: '100%' }}
              >
                {map(currencyToSymbolMap, (symbol, currency) => (
                  <Select.Option value={currency} key={currency}>
                    {`${currency} ${symbol}`}
                  </Select.Option>
                ))}
              </Field>
              <Field
                name="minimum_fraction_digits"
                min={0}
                max={10}
                component={AInputNumber}
                label={<Trans>Decimal places</Trans>}
              />
              <Field
                showSearch
                name="locale"
                component={ASelect}
                label={<Trans>Date format</Trans>}
                style={{ width: '100%' }}
              >
                <Select.Option value={util.DEFAULT_LOCALE_KEY} key={util.DEFAULT_LOCALE_KEY}>
                  {util.DEFAULT_LOCALE_KEY}
                </Select.Option>
                {map(moment.locales().filter(l => l !== util.DEFAULT_LOCALE_KEY), (localeStr) => (
                  <Select.Option value={localeStr} key={localeStr}>
                    {localeStr}
                  </Select.Option>
                ))}
              </Field>
              <Field name="due_days" component={AInput} label={<Trans>Due days</Trans>} />
              <Field
                name="overdue_charge"
                component={AInput}
                label={<Trans>Overdue charge</Trans>}
              />
              <Field name="notes" component={ATextarea} label={<Trans>Notes</Trans>} rows={4} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={pristine || submitting}
                loading={submitting}
                style={{ marginBottom: 40 }}
              >
                <Trans>Save</Trans>
              </Button>
            </Col>
          </Row>
        </Form>
        <Row>
          <Col span={12}>
            <h2>
              <PictureOutlined />
              {` `}
              <Trans>Logo</Trans>
            </h2>
            {logo ? <img src={logo} alt="logo" style={{ maxWidth: 250, maxHeight: 250 }} /> : ''}
            <br />
            <Upload
              accept="image/*"
              showUploadList={false}
              customRequest={data => this.handleLogoUpload(data)}
            >
              <Button style={{ marginTop: 20 }}>
                <UploadOutlined /> {logo ? <Trans>Change</Trans> : <Trans>Upload</Trans>}
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
      return new Promise((resolve, reject) => {
        dispatch({ type: 'organizations/save', data: data, resolve, reject });
      });
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
