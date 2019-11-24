import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { Button, Icon, Select, Table } from 'antd';
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd'
import { get, map } from 'lodash';

import currency from 'currency.js';

import { AInput, ASelect, ATextarea } from '../forms/fields';
import { required } from '../forms/validators';

const getItemStyle = (isCurrentHover, draggableStyle) => ({
  background: isCurrentHover ? "rgba(24, 144, 255, 0.1)" : undefined,
  // styles we need to apply on draggables
  ...draggableStyle
});

class DragableBodyRow extends Component {
  state = {
    currentHover: false
  }
  render() {
    const key = parseInt(this.props['data-row-key']);
    const draggableId = `key-${key}`;
    const { currentHover } = this.state;
    const { children, draggingIndex, ...restProps } = this.props;

    return (
      <Draggable draggableId={draggableId} index={key}>
        {
          (provided) => {
            const isCurrentHover = draggingIndex === -1 ? currentHover : (draggingIndex === key);
            return <tr ref={provided.innerRef}
              {...provided.draggableProps}
              {...restProps}
              style={getItemStyle(isCurrentHover, provided.draggableProps.style)}
              onMouseOver={() => this.setState({ currentHover: true })}
              onMouseLeave={() => this.setState({ currentHover: false })}
            >
              <td {...provided.dragHandleProps}>{isCurrentHover ? <Icon type="drag" style={{ color: '#1890ff', marginLeft: 10 }} /> : ''}</td>
              {children.slice(1)}
            </tr>
          }
        }
      </Draggable>
    )
  }
}

class DroppableBody extends Component {
  render() {
    const { children, ...restProps } = this.props;
    return (
      <Droppable droppableId="droppable">
        {
          (provided, snapshot) => (
            <tbody ref={provided.innerRef}
              {...restProps}
              {...provided.droppableProps}
            >
              {children}
              {provided.placeholder}
            </tbody>
          )
        }
      </Droppable>
    );
  }
}

class LineItems extends Component {
  state = {
    draggingIndex: -1,
  };

  components = {
    body: {
      wrapper: DroppableBody,
      row: DragableBodyRow
    }
  };

  onQuantityChange = (newValue, previousValue, index) => {
    const lineItem = get(this.props.lineItems, index);

    const unitPrice = get(lineItem, 'unitPrice');
    const subtotal = get(lineItem, 'subtotal');

    if (unitPrice) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].subtotal`,
          currency(newValue, { separator: '' })
            .multiply(unitPrice)
            .format()
        )
      );
    } else if (subtotal) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].unitPrice`,
          currency(subtotal, { separator: '' })
            .divide(newValue)
            .format()
        )
      );
    }
  };

  onUnitPriceChange = (newValue, previousValue, index) => {
    const lineItem = get(this.props.lineItems, index);

    const quantity = get(lineItem, 'quantity');
    const subtotal = get(lineItem, 'subtotal');

    if (quantity) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].subtotal`,
          currency(newValue, { separator: '' })
            .multiply(quantity)
            .format()
        )
      );
    } else if (subtotal) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].quantity`,
          currency(subtotal, { separator: '' })
            .divide(newValue)
            .format()
        )
      );
    }
  };

  onSubtotalChange = (newValue, previousValue, index) => {
    const lineItem = get(this.props.lineItems, index);

    const quantity = get(lineItem, 'quantity');
    const unitPrice = get(lineItem, 'unitPrice');

    if (quantity) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].unitPrice`,
          currency(newValue, { separator: '' })
            .divide(quantity)
            .format()
        )
      );
    } else if (unitPrice) {
      this.props.dispatch(
        change(
          'invoice',
          `lineItems[${index}].quantity`,
          currency(newValue, { separator: '' })
            .divide(unitPrice)
            .format()
        )
      );
    }
  };

  onDragEnd = result => {
    this.setState({ draggingIndex: -1 })
    if (!result.destination || result.reason === 'CANCEL') {
      return;
    }
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }
    const { fields } = this.props;
    fields.move(result.source.index, result.destination.index);
  }

  onDragStart = start => {
    this.setState({ draggingIndex: parseInt(start.draggableId.split('-')[1]) });
  }

  render() {
    const { draggingIndex } = this.state;
    const { fields, taxRates } = this.props;

    const data = [];
    fields.forEach((member, index) => {
      data.push({
        key: index,
        description: `${member}.description`,
        quantity: `${member}.quantity`,
        unitPrice: `${member}.unitPrice`,
        subtotal: `${member}.subtotal`,
        taxRate: `${member}.taxRate`,
      });
    });

    return (
      <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
        <Table dataSource={data} pagination={false} size="middle" className="line-items" components={this.components} onRow={() => ({
          draggingIndex
        })}>
          <Table.Column
            title=""
            dataIndex="move"
            key="move"
            width={30}
          />
          <Table.Column
            title="Description"
            dataIndex="description"
            key="description"
            render={field => <Field name={field} component={ATextarea} autoSize />}
          />
          <Table.Column
            title="Quantity"
            dataIndex="quantity"
            key="quantity"
            width={120}
            render={(field, row, index) => (
              <Field
                name={field}
                component={AInput}
                onChange={(event, newValue, previousValue) =>
                  this.onQuantityChange(newValue, previousValue, index)
                }
                validate={[required]}
              />
            )}
          />
          <Table.Column
            title="Price"
            dataIndex="unitPrice"
            key="price"
            width={120}
            render={(field, row, index) => (
              <Field
                name={field}
                component={AInput}
                onChange={(event, newValue, previousValue) =>
                  this.onUnitPriceChange(newValue, previousValue, index)
                }
                validate={[required]}
              />
            )}
          />
          <Table.Column
            title="Subtotal"
            dataIndex="subtotal"
            key="subtotal"
            width={120}
            render={(field, row, index) => (
              <Field
                name={field}
                component={AInput}
                onChange={(event, newValue, previousValue) =>
                  this.onSubtotalChange(newValue, previousValue, index)
                }
                validate={[required]}
              />
            )}
          />
          <Table.Column
            title="Tax rate"
            dataIndex="taxRate"
            key="taxRate"
            render={(field, row, index) => (
              <Field name={field} component={ASelect} options={[]}>
                {map(taxRates.items, rate => {
                  return (
                    <Select.Option value={rate._id} key={rate._id}>
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
            render={row => <Icon type="delete" onClick={() => fields.remove(row.key)} />}
          />
        </Table>

        <Button type="default" onClick={() => fields.push({})} style={{ marginTop: '10px' }}>
          Add row
        </Button>
      </DragDropContext>
    );
  }
}

const selector = formValueSelector('invoice');

export default connect(state => ({
  taxRates: state.taxRates,
  lineItems: selector(state, 'lineItems'),
}))(LineItems);
