import { Component } from 'react';
import { Dropdown, Menu } from 'antd';
import StateTag from '../../components/invoices/state-tag';

class StateDropDown extends Component {
  triggerChange = value => {
    this.props.onChange(value);
  };

  render() {
    // Invoice state menu
    console.log('drop value', this.props)
    const menu = <Menu onClick={({item, key}) => this.triggerChange(key)}>
        <Menu.Item key="draft">Draft</Menu.Item>
        <Menu.Item key="confirmed">Confirmed</Menu.Item>
        <Menu.Item key="payed">Payed</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="void">Void</Menu.Item>
      </Menu>

    return (
      <Dropdown trigger={['click']} overlay={menu}>
        <StateTag state={this.props.value} />
      </Dropdown>
    );
  }
}

export default StateDropDown;
