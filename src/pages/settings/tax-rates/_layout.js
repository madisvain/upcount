import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Col, Layout, Row, Table } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { values } from 'lodash';

import Link from 'umi/link';

class TaxRates extends Component {
  componentDidMount() {
    this.props.dispatch({ type: 'taxRates/list' });
    this.props.dispatch({ type: 'settings/initialize' });
  }

  render() {
    const { children, taxRates } = this.props;

    return (
      <div>
        <Layout.Content>
          <Row>
            <Col span={24}>
              <h2>
                <CalculatorOutlined />
                {` `}
                <Trans>Tax rates</Trans>
              </h2>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Link to="/settings/tax-rates/new">
                <Button type="primary" style={{ marginBottom: 10 }}>
                  <Trans>New tax</Trans>
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                dataSource={values(taxRates.items)}
                pagination={false}
                loading={taxRates.loading}
                rowKey="_id"
                size="middle"
                bordered
                style={{ width: '100%' }}
              >
                <Table.Column
                  title={<Trans>Name</Trans>}
                  key="name"
                  render={taxRate => (
                    <Link to={`/settings/tax-rates/${taxRate._id}`}>{taxRate.name}</Link>
                  )}
                />
                <Table.Column
                  title={<Trans>Description</Trans>}
                  dataIndex="description"
                  key="description"
                />
                <Table.Column
                  title={<Trans>Percentage</Trans>}
                  dataIndex="percentage"
                  className="text-right"
                  key="percentage"
                  render={percentage => `${percentage} %`}
                />
              </Table>
            </Col>
          </Row>
        </Layout.Content>
        {children}
      </div>
    );
  }
}

export default compose(
  connect(state => ({
    taxRates: state.taxRates,
  }))
)(TaxRates);
