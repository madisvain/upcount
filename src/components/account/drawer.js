import { useState } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { Button, Drawer, List, Switch, Tooltip, Typography } from 'antd';
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
import { assign, capitalize, get, values } from 'lodash';

import moment from 'moment';

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

const HasToken = (visible, closeDrawer, organizations, dispatch) => {
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
      <div>
        <Title level={4}>
          <Trans>Organizations syncing</Trans>
        </Title>
        <p>Toggle the organizations you want to enable syncronization for.</p>
        <List
          itemLayout="horizontal"
          dataSource={values(organizations.items)}
          renderItem={organization => (
            <List.Item
              actions={[
                organization.sync ? (
                  <div>
                    {get(JSON.parse(localStorage.getItem('syncedAt')), organization._id)
                      ? moment(
                          get(JSON.parse(localStorage.getItem('syncedAt')), organization._id)
                        ).format('YYYY-MM-DD HH:mm')
                      : '-'}{' '}
                    <SyncOutlined />
                  </div>
                ) : null,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Switch
                    checked={get(organization, 'sync', false)}
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    onChange={checked => {
                      dispatch({
                        type: 'organizations/setSync',
                        data: assign(organization, { sync: checked }),
                      });
                    }}
                  />
                }
                title={organization.name}
              />
            </List.Item>
          )}
        />
      </div>
      <p style={{ marginTop: 40 }}>
        <SwapOutlined style={{ fontSize: 20, marginRight: 8, float: 'left' }} />
        Your data is always securely transfered between the hosted CouchDB server and your devices
        over encrypted HTTP requests.
      </p>
    </Drawer>
  );
};

const AccountDrawer = ({ visible, closeDrawer, organizations, dispatch }) => {
  return localStorage.getItem('token') && localStorage.getItem('email')
    ? HasToken(visible, closeDrawer, organizations, dispatch)
    : NeedsToken(visible, closeDrawer);
};

export default compose(
  withI18n(),
  connect(state => ({
    organizations: state.organizations,
  }))
)(AccountDrawer);
