import { useState } from 'react';
import { useRxCollection, useRxData } from 'rxdb-hooks';
import {
  Button,
  DatePicker,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Layout,
  Menu,
  Modal,
  Table,
  Row,
  Col,
  Select,
  Space,
  Typography,
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilePdfOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { forEach, get, isString, includes, has, lowerCase, map } from 'lodash';

import Link from 'umi/link';
import router from 'umi/router';
import currency from 'currency.js';
import currencyToSymbolMap from 'currency-symbol-map/map';

import StateTag from '../../../components/invoices/state-tag';
import FooterToolbar from '../../../components/layout/footer-toolbar';
import { OrganizationContext } from '../../../providers/contexts';

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const totals = (lineItems, taxRates) => {
  let subTotal = currency(0, { separator: '', symbol: '' });
  let taxTotal = currency(0, { separator: '', symbol: '' });

  forEach(lineItems, line => {
    if (has(line, 'subtotal')) {
      subTotal = subTotal.add(line.subtotal);
      if (has(line, 'taxRate')) {
        const taxRate = get(taxRates.items, line.taxRate);
        if (taxRate) {
          const lineTax = currency(line.subtotal).multiply(taxRate.percentage / 100);
          taxTotal = taxTotal.add(lineTax);
        }
      }
    }
  });

  const total = subTotal.add(taxTotal);
  return { subTotal, taxTotal, total };
};

const InvoiceForm = props => {
  const { children, i18n } = props;

  const [submitting, setSubmitting] = useState(false);
  const { result: invoice, isFetching } = useRxData('invoices', collection =>
    collection.findOne(get(props, 'match.params.id'))
  );
  const { result: clients } = useRxData('clients', collection => collection.find());

  console.log(invoice);

  // Undefined
  const currency = 'EUR';
  const subTotal = 0;
  const taxTotal = 0;
  const total = 0;

  const isNew = () => {
    const {
      match: { params },
    } = props;

    return has(params, 'id') && params['id'] === 'new';
  };

  const clientSelect = value => {
    if (value === 'new') {
      const {
        match: { params },
      } = props;

      router.push({
        pathname: `/invoices/${get(params, 'id', 'new')}/client`,
      });
    }
  };

  const onStateSelect = (_id, _rev, key) => {
    this.props.dispatch({
      type: 'invoices/state',
      payload: {
        _id,
        _rev,
        state: key,
      },
    });
  };

  const deleteConfirm = (_id, _rev) => {
    Modal.confirm({
      title: 'Are you sure delete this invoice?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        this.props.dispatch({
          type: 'invoices/remove',
          data: {
            _id,
            _rev,
          },
        });
      },
    });
  };

  const printPDF = invoiceId => {
    const { ipcRenderer } = window.require('electron');

    ipcRenderer.send('printInvoicePDF', invoiceId);
  };

  const stateMenu = (_id, _rev) => (
    <Menu onClick={({ item, key }) => this.onStateSelect(_id, _rev, key)}>
      <Menu.Item key="draft">
        <Trans>Draft</Trans>
      </Menu.Item>
      <Menu.Item key="confirmed">
        <Trans>Confirmed</Trans>
      </Menu.Item>
      <Menu.Item key="paid">
        <Trans>Paid</Trans>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="void">
        <Trans>Void</Trans>
      </Menu.Item>
    </Menu>
  );

  const onFinish = values => {
    console.log('Success:', values);
  };

  // Invoice form
  return (
    <Layout.Content className="has-toolbar">
      <Form onFinish={onFinish} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Select or create a client"
              name="client"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <Select
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) => {
                  const clientName = get(option, ['props', 'children']);
                  if (isString(clientName)) {
                    return includes(lowerCase(clientName), lowerCase(input));
                  }
                  return true;
                }}
              >
                {map(clients, (client, id) => (
                  <Select.Option value={id} key={id}>
                    {get(client, 'name', '-')}
                  </Select.Option>
                ))}
                <Select.Option value="new" key="new" style={{ borderTop: '1px solid #e8e8e8' }}>
                  <UserAddOutlined />
                  Create new client
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Invoice number"
              name="number"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Currency"
              name="currency"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <Select>
                {map(currencyToSymbolMap, (symbol, currency) => (
                  <Select.Option value={currency} key={currency}>
                    {`${currency} ${symbol}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6} offset={12}>
            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Due date"
              name="due_date"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {/*<Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={24}>
            <FieldArray name="lineItems" component={LineItems} />
          </Col>
        </Row>*/}

        <Row gutter={16}>
          <Col span={8} style={{ marginTop: '20px' }}>
            <Form.Item
              label="Customer note"
              name="customer_note"
              rules={[{ required: true, message: 'This field is required!' }]}
            >
              <TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={12} offset={4} style={{ marginTop: '31px' }}>
            <OrganizationContext.Consumer>
              {context => (
                <table style={{ width: '100%' }}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'right', width: '50%' }}>
                        <h4>
                          <Trans>Subtotal</Trans>
                        </h4>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <h4>
                          {i18n.number(subTotal, {
                            style: 'currency',
                            currency:
                              currency || get(context.state, 'organization.currency', 'EUR'),
                            minimumFractionDigits: get(
                              context.state,
                              'organization.minimum_fraction_digits',
                              2
                            ),
                          })}
                        </h4>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'right' }}>
                        <Trans>Tax</Trans>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {i18n.number(taxTotal, {
                          style: 'currency',
                          currency: currency || get(context.state, 'organization.currency', 'EUR'),
                          minimumFractionDigits: get(
                            context.state,
                            'organization.minimum_fraction_digits',
                            2
                          ),
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'right', paddingTop: 24 }}>
                        <h2>
                          <Trans>Total</Trans>
                        </h2>
                      </td>
                      <td style={{ textAlign: 'right', paddingTop: 24 }}>
                        <h2>
                          {i18n.number(total, {
                            style: 'currency',
                            currency:
                              currency || get(context.state, 'organization.currency', 'EUR'),
                            minimumFractionDigits: get(
                              context.state,
                              'organization.minimum_fraction_digits',
                              2
                            ),
                          })}
                        </h2>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </OrganizationContext.Consumer>
          </Col>
        </Row>

        <FooterToolbar
          extra={
            <div>
              {!isNew() && (
                <Button type="dashed" onClick={() => this.deleteConfirm(invoice._id, invoice._rev)}>
                  <DeleteOutlined /> <Trans>Delete</Trans>
                </Button>
              )}
            </div>
          }
        >
          {!isNew() && invoice && (
            <Dropdown overlay={stateMenu(invoice._id, invoice._rev)} trigger={['click']}>
              <StateTag state={invoice.state} style={{ marginTop: 10, marginRight: 20 }} />
            </Dropdown>
          )}
          {!isNew() && (
            <Link to={`/invoices/${get(this.props, ['match', 'params', 'id'])}/preview`}>
              <Button type="dashed" style={{ marginTop: 10, marginRight: 8 }}>
                <EyeOutlined /> <Trans>View</Trans>
              </Button>
            </Link>
          )}
          {!isNew() && (
            <Button
              style={{ marginTop: 10 }}
              onClick={() => this.printPDF(get(this.props, ['match', 'params', 'id']))}
            >
              <FilePdfOutlined /> <Trans>PDF</Trans>
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            disabled={submitting}
            loading={submitting}
            style={{ marginTop: 10 }}
          >
            <SaveOutlined /> <Trans>Save</Trans>
          </Button>
        </FooterToolbar>
      </Form>
      {children}
    </Layout.Content>
  );
};

export default withI18n()(InvoiceForm);
