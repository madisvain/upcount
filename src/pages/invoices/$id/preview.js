import { Component } from 'react';
import { connect } from 'dva';
import { Button, Icon } from 'antd';
import { get } from 'lodash';

import Link from 'umi/link';

import FooterToolbar from '../../../components/layout/footer-toolbar';

class InvoicePreview extends Component {
  render() {
    const { invoices } = this.props;
    const invoice = get(invoices.items, get(this.props, ['match', 'params', 'id']));

    return (
      <div>
        <h1>{invoice.number}</h1>
        <FooterToolbar className="footer-toolbar">
          <Link to={`/invoices/${get(invoice, '_id')}`}>
            <Button type="dashed" style={{ marginTop: 10, marginRight: 8 }}>
              <Icon type="edit" />
              Edit
            </Button>
          </Link>
          <Button style={{ marginTop: 10 }} onClick={() => window.print()}>
            <Icon type="printer" />
            Print
          </Button>
        </FooterToolbar>
      </div>
    );
  }
}

export default connect(state => {
  return {
    clients: state.clients,
    invoices: state.invoices,
  };
})(InvoicePreview);
