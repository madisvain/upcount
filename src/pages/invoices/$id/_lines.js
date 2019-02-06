import { Component } from 'react';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { Button, Icon, Select, Table } from 'antd';
import { map } from 'lodash';

import { AInput, ASelect, ATextarea } from '../../../components/fields';

class LineItems extends Component {
  componentDidMount() {
    const { fields } = this.props;
    if (fields.length === 0) {
      fields.push({});
    }
  }

  render() {
    const { fields, taxRates } = this.props;

    const data = [];
    fields.forEach((member, index) => {
      data.push({
        key: index,
        description: `${member}.description`,
        quantity: `${member}.quantity`,
        unit_price: `${member}.unit_price`,
        subtotal: `${member}.subtotal`,
        total: `${member}.total`,
        tax_rate: `${member}.tax_rate`,
      });
    });

    return (
      <div>
        <Table dataSource={data} pagination={false} size="middle" className="line-items">
          <Table.Column
            title="Description"
            dataIndex="description"
            key="description"
            render={field => (
              <Field name={field} component={ATextarea} autosize />
            )}
          />
          <Table.Column
            title="Quantity"
            dataIndex="quantity"
            key="quantity"
            width={120}
            render={field => <Field name={field} component={AInput} />}
          />
          <Table.Column
            title="Price"
            dataIndex="unit_price"
            key="price"
            width={120}
            render={field => <Field name={field} component={AInput} />}
          />
          <Table.Column
            title="Subtotal"
            dataIndex="subtotal"
            key="subtotal"
            width={120}
            render={field => <Field name={field} component={AInput} />}
          />
          <Table.Column
            title="Tax rate"
            dataIndex="tax_rate"
            key="tax_rate"
            render={field => (
              <Field name={field} component={ASelect} options={[]}>
                {map(taxRates.items, rate => {
                  return (
                    <Select.Option value={rate.url} key={rate.id}>
                      {rate.name}
                    </Select.Option>
                  );
                })}
              </Field>
            )}
          />
          <Table.Column
            title=""
            key="delete"
            render={row => (
              <Icon
                type="delete"
                onClick={() => fields.remove(row.key)}
              />
            )}
          />
        </Table>
        
        <Button
          type="default"
          onClick={() => fields.push({})}
          style={{ marginTop: '10px' }}
        >
          Add row
        </Button>
      </div>
    );
  }
}

export default connect(state => ({
  taxRates: state.taxRates,
}))(LineItems);