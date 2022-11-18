import React, { useEffect, useState } from 'react';
import { useRxCollection } from 'rxdb-hooks';
import { Drawer } from 'antd';
import { Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { has } from 'lodash';

import router from 'umi/router';

import ClientForm from '../../components/clients/form';

const ClientFormDrawer = props => {
  const [submitting, setSubmitting] = useState(false);
  const clientsCollection = useRxCollection('clients');

  const {
    match: { params },
  } = props;
  console.log(params['id']);
  /*
  clientsCollection
    .findOne(params['id'])
    .exec()
    .then(doc => console.dir(doc));
  */

  const handleSubmit = values => {
    setSubmitting(true);
    console.log(values);
    clientsCollection.insert(values);
    setSubmitting(false);
    closeDrawer();
  };

  const closeDrawer = () => {
    router.push({
      pathname: '/clients',
    });
  };

  const isNew = () => {
    const {
      match: { params },
    } = props;

    return has(params, 'id') && params['id'] === 'new';
  };

  return (
    <Drawer
      title={isNew() ? <Trans>Add client</Trans> : <Trans>Edit client</Trans>}
      width={450}
      placement="right"
      onClose={closeDrawer}
      maskClosable={true}
      open={true}
    >
      <ClientForm
        initialValues={{ emails: [] }}
        handleSubmit={handleSubmit}
        submitting={submitting}
      />
    </Drawer>
  );
};

export default withI18n()(ClientFormDrawer);

/*
export default compose(
  connect(state => ({
    initialValues: {
      emails: [],
    },
  })),
  reduxForm({
    form: 'client',
    onSubmit: async (data, dispatch) => {
      return await dispatch({ type: 'clients/save', data: data });
    },
    onSubmitSuccess: (result, dispatch) => {
      router.push({
        pathname: '/clients',
      });
    },
  })
)(ClientFormDrawer);
*/
