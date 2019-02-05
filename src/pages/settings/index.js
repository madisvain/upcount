import { Component } from 'react';
import { connect } from 'dva';
import { Col, Row } from 'antd';

import { AInput } from '../../components/fields';

class Index extends Component {
  render() {
    return (
      <div>
        <h1>Settings</h1>
        <Row>
          <Col span={12}>
            <h2>Company details</h2>
          </Col>
          <Col span={12}>
            <h2>Tax rates</h2>
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect((state) => { return { invoice: state.invoice }; })(Index);