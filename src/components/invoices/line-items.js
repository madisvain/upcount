import { Component } from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector, change } from 'redux-form';
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { Button, Icon, Select, Table } from 'antd';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { get, map } from 'lodash';

import currency from 'currency.js';
import HTML5Backend from 'react-dnd-html5-backend';

import { AInput, ASelect, ATextarea } from '../forms/fields';
import { required } from '../forms/validators';

let dragingIndex = -1;

class TableBodyRow extends Component {
  render() {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props;
    const style = { ...restProps.style, cursor: 'move' };

    let { className } = restProps;
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward';
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward';
      }
    }

    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    );
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
  drop(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

const DragableTableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource(),
  }))(TableBodyRow)
);

class LineItems extends Component {
  components = {
    body: {
      row: DragableTableBodyRow,
    },
  };

  moveRow = (dragIndex, hoverIndex) => {
    const { fields } = this.props;
    fields.move(dragIndex, hoverIndex);
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
        <I18n>
          {({ i18n }) => (
            <Table
              dataSource={data}
              pagination={false}
              size="middle"
              className="line-items"
              components={this.components}
              onRow={(record, index) => ({
                index,
                moveRow: this.moveRow,
              })}
            >
              <Table.Column
                title={i18n._(t`Description`)}
                dataIndex="description"
                key="description"
                render={field => (
                  <div>
                    <Icon type="more" style={{ position: 'absolute', marginTop: 15, left: -15 }} />
                    <Field
                      name={field}
                      component={ATextarea}
                      autoSize
                      onDrop={e => e.preventDefault()}
                    />
                  </div>
                )}
              />
              <Table.Column
                title={i18n._(t`Quantity`)}
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
                title={i18n._(t`Price`)}
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
                title={i18n._(t`Subtotal`)}
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
                title={i18n._(t`Tax`)}
                dataIndex="taxRate"
                key="taxRate"
                render={(field, row, index) => (
                  <div>
                    <Field
                      name={field}
                      component={ASelect}
                      options={[]}
                      onDrop={e => e.preventDefault()}
                    >
                      {map(taxRates.items, rate => {
                        return (
                          <Select.Option value={rate._id} key={rate._id}>
                            {rate.name}
                          </Select.Option>
                        );
                      })}
                    </Field>
                    <Icon
                      type="delete"
                      onClick={() => fields.remove(row.key)}
                      style={{ position: 'absolute', marginTop: -25, right: -20 }}
                    />
                  </div>
                )}
              />
            </Table>
          )}
        </I18n>

        <Button type="default" onClick={() => fields.push({})} style={{ marginTop: '10px' }}>
          <Trans>Add row</Trans>
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
