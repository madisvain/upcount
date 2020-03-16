import { useState } from 'react';
import { Button, Drawer, Typography } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { capitalize } from 'lodash';

import LoginForm from './login';
import RegisterForm from './register';

const { Title } = Typography;

const AccountDrawer = ({ visible, closeDrawer }) => {
  const [form, setForm] = useState(null);

  return (
    <Drawer
      visible={visible}
      title={true ? null : 'Upcount account'}
      placement="right"
      closable={false}
      onClose={closeDrawer}
      width={500}
    >
      <Title level={4} style={{ textAlign: 'center', marginTop: 100, marginBottom: 40 }}>
        <Trans>To start syncing</Trans> <SyncOutlined />
      </Title>
      <p style={{ textAlign: 'center' }}>
        <Button type="primary" onClick={() => setForm('login')} style={{ marginRight: 12 }}>
          <Trans>Log in</Trans>
        </Button>
        <Button onClick={() => setForm('register')}>
          <Trans>Register</Trans>
        </Button>
      </p>
      {/* Subdrawer */}
      <Drawer
        visible={form ? true : false}
        title={form ? capitalize(form) : null}
        width={380}
        closable={true}
        onClose={() => setForm(null)}
      >
        {form === 'login' ? (
          <LoginForm setForm={() => setForm(null)} />
        ) : (
          <RegisterForm setForm={() => setForm(null)} />
        )}
      </Drawer>
    </Drawer>
  );
};

export default AccountDrawer;
