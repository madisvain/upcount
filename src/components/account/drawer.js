import { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Drawer, Switch, Tooltip, Typography } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeploymentUnitOutlined,
  LockOutlined,
  SyncOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { capitalize } from 'lodash';

import LoginForm from './login';
import RegisterForm from './register';

const { Title } = Typography;

const NeedsToken = (visible, closeDrawer) => {
  const [form, setForm] = useState(null);

  return (
    <Drawer
      visible={visible}
      title="Upcount account"
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
          <LoginForm closeDrawer={closeDrawer} />
        ) : (
          <RegisterForm closeDrawer={closeDrawer} />
        )}
      </Drawer>
      <p style={{ marginTop: 40 }}>
        <DeploymentUnitOutlined style={{ fontSize: 20, marginRight: 8, float: 'left' }} />
        Registering an Upcount account will allow you to syncronize your data between computers and
        provides a secure backup.
      </p>
      <p>
        <SwapOutlined style={{ fontSize: 20, marginRight: 8, float: 'left' }} />
        Your data is always securely transfered between the hosted CouchDB server and your devices
        over encrypted HTTP requests.
      </p>
    </Drawer>
  );
};

const HasToken = (visible, closeDrawer, dispatch) => {
  return (
    <Drawer
      visible={visible}
      title={
        <div>
          {localStorage.getItem('email')}
          <Tooltip title="Logout">
            <LockOutlined
              onClick={() => {
                dispatch({ type: 'accounts/logout' });
                closeDrawer();
                window.location.reload();
              }}
              style={{ float: 'right' }}
            />
          </Tooltip>
        </div>
      }
      placement="right"
      closable={false}
      onClose={closeDrawer}
      width={500}
    >
      <Title level={4} style={{ textAlign: 'center', marginTop: 100, marginBottom: 40 }}>
        <Trans>Sync enabled</Trans> <SyncOutlined />
      </Title>
      <Tooltip title="To disable syncing log out.">
        <div>
          <Switch
            checked={true}
            disabled={true}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            style={{ marginBottom: 60, marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
          />
        </div>
      </Tooltip>
      <p style={{ marginTop: 40 }}>
        <SwapOutlined style={{ fontSize: 20, marginRight: 8, float: 'left' }} />
        Your data is always securely transfered between the hosted CouchDB server and your devices
        over encrypted HTTP requests.
      </p>
    </Drawer>
  );
};

const AccountDrawer = ({ visible, closeDrawer, dispatch }) => {
  return localStorage.getItem('token') && localStorage.getItem('email')
    ? HasToken(visible, closeDrawer, dispatch)
    : NeedsToken(visible, closeDrawer);
};

export default compose(
  withI18n(),
  connect(state => ({
    organizations: state.organizations,
  }))
)(AccountDrawer);
