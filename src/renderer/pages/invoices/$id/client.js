import { Component } from 'react';
import { compose } from 'redux';
import { connect } from 'dva';
import { reduxForm, autofill } from 'redux-form';
import { Drawer } from 'antd';
import { get } from 'lodash';

import pathToRegexp from 'path-to-regexp';
import router from 'umi/router';

import ClientForm from '../../../components/clients/form';

class ClientFormDrawer extends Component {
  closeDrawer = () => {
    const pathname = get(this.props, ['location', 'pathname']);
    const match = pathToRegexp(`(.*)/:subpath`).exec(pathname);

    router.push({
      pathname: get(match, 1, '/clients'),
    });
  };

  render() {
    return (
      <Drawer
        title="Add client"
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
    onSubmit: async (data, dispatch, props) => {
      const pathname = get(props, ['location', 'pathname']);
      const match = pathToRegexp(`(.*)/:subpath`).exec(pathname);

      return await dispatch({
        type: 'clients/save',
        data: data,
        redirect: get(match, 1, 'clients'),
      });
    },
    onSubmitSuccess: (result, dispatch) => {
      dispatch(autofill('invoice', 'client', result._id));
    },
  })
)(ClientFormDrawer);