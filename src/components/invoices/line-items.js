import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { Button, Icon, Select, Table } from 'antd';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { get, map } from 'lodash';

import currency from 'currency.js';

import { AInput, ASelect, ATextarea } from '../forms/fields';
import { required } from '../forms/validators';

let dragingIndex = -1;

class BodyRow extends Component {
  state = {
    currentHover: false
  }
  getItemStyle = (isCurrentHover, isDownward, style) => ({
    background: isCurrentHover ? "rgba(24, 144, 255, 0.1)" : undefined,
    cursor: 'grab',
    borderBottom: isCurrentHover && isDownward ? '2px dashed #1890ff' : undefined,
    borderTop: isCurrentHover && !isDownward ? '2px dashed #1890ff' : undefined,
    // styles we need to apply on draggables
    ...style
  });

  render() {
    const { currentHover } = this.state;
    const { isOver, connectDragSource, connectDropTarget, connectDragPreview, moveRow, children, style, index, ...restProps } = this.props;
    const isCurrentHover = dragingIndex === -1 ? currentHover : isOver;

    return connectDragPreview(connectDropTarget(
      <tr
        {...restProps}
        style={this.getItemStyle(isCurrentHover, index > dragingIndex, style)}
        onMouseOver={() => this.setState({ currentHover: true })}
        onMouseLeave={() => this.setState({ currentHover: false })}
      >
        {connectDragSource(<td>{isCurrentHover ? <Icon type="drag" style={{ color: '#1890ff', marginLeft: 10 }} /> : ''}</td>)}
        {children.slice(1)}
      </tr>
    ))
  }
}

const rowSource = {
  beginDrag(props) {
    dragingIndex = props.index;
    return {
      index: props.index,
    };
  },
};

const rowTarget = {
  drop() {
    dragingIndex = -1;
  },
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;
    console.log('asdf', dragIndex, hoverIndex)

    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRow(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  }
};

const DragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview()
  }))(BodyRow),
);

class LineItems extends Component {
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { fields } = this.props;
    fields.move(dragIndex, hoverIndex)
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

  render() {
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
      <DndProvider backend={HTML5Backend}>
        <Table dataSource={data} pagination={false} components={this.components} size="middle" className="line-items" onRow={(record, index) => ({
            index,
            moveRow: this.moveRow,
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
            render={field => <Field name={field} component={ATextarea} autoSize onDrop={e => e.preventDefault()} />}
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
                onDrop={e => e.preventDefault()}
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
                onDrop={e => e.preventDefault()}
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
                onDrop={e => e.preventDefault()}
              />
            )}
          />
          <Table.Column
            title="Tax rate"
            dataIndex="taxRate"
            key="taxRate"
            render={(field, row, index) => (
              <Field name={field} component={ASelect} options={[]} onDrop={e => e.preventDefault()} >
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
      </DndProvider>
    );
  }
}

const selector = formValueSelector('invoice');

export default connect(state => ({
  taxRates: state.taxRates,
  lineItems: selector(state, 'lineItems'),
}))(LineItems);
