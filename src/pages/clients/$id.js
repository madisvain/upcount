import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { reduxForm } from 'redux-form';
import { Drawer } from 'antd';
import { has } from 'lodash';

import router from 'umi/router';

import ClientForm from '../../components/clients/form'

class ClientFormDrawer extends Component {
  closeDrawer = () => {
    router.push({
      pathname: '/clients',
    });
  };

  componentWillMount() {
    const {
      match: { params },
    } = this.props;

    if (!this.isNew()) {
      this.props.dispatch({
        type: 'clients/initialize',
        payload: {
          id: params['id'],
        },
      });
    }
  }

  isNew = () => {
    const {
      match: { params },
    } = this.props;

    return has(params, 'id') && params['id'] === 'new';
  };

  render() {
    return (
      <Drawer
        title={this.isNew() ? 'Add client' : 'Edit client'}
        width={450}
        placement="right"
        onClose={this.closeDrawer}
        maskClosable={true}
        visible={true}
        style={{
          height: 'calc(100% - 55px)',
          overflow: 'auto',
          paddingBottom: 53,
        }}
      >
        <ClientForm {...this.props} />
      </Drawer>
    );
  }
}

export default compose(
  connect(state => ({
    initialValues: {
      emails: [],
    },
  })),
  reduxForm({
    form: 'client',
    onSubmit: (data, dispatch) => {
      return new Promise((resolve, reject) => {
        dispatch({ type: 'clients/save', data: data, resolve, reject });
      });
    },
  })
)(ClientFormDrawer);
