import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Col, Icon, Layout, Row, Table } from 'antd';
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
            <Col>
              <h2>
                <Icon type="calculator" />
                {` Tax rates`}
              </h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <Link to="/settings/tax-rates/new">
                <Button type="primary" style={{ marginBottom: 10 }}>
                  New tax
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table
                dataSource={values(taxRates.items)}
                pagination={false}
                loading={taxRates.loading}
                rowKey="_id"
                size="middle"
                bordered
              >
                <Table.Column
                  title="Name"
                  key="name"
                  render={taxRate => (
                    <Link to={`/settings/tax-rates/${taxRate._id}`}>{taxRate.name}</Link>
                  )}
                />
                <Table.Column title="Description" dataIndex="description" key="description" />
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
