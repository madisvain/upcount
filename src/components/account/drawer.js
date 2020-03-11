import { Drawer } from 'antd';

const AccountDrawer = ({ visible, onClose }) => {
  return (
    <Drawer
      visible={visible}
      title="User account"
      placement="right"
      closable={false}
      onClose={onClose}
    >
      <p>Some contents...</p>
      <p>Some contents...</p>
      <p>Some contents...</p>
    </Drawer>
  );
};

export default AccountDrawer;
