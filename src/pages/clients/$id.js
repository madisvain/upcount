import React, { useState } from 'react';
import { useRxCollection, useRxData } from 'rxdb-hooks';
import { Drawer, Spin } from 'antd';
import { Trans } from '@lingui/macro';
import { withI18n } from '@lingui/react';
import { first, get, has } from 'lodash';

import router from 'umi/router';

import ClientForm from '../../components/clients/form';

const ClientFormDrawer = props => {
  const [submitting, setSubmitting] = useState(false);

  const collection = useRxCollection('clients');
  const { result: client, isFetching } = useRxData('clients', collection =>
    collection.findOne(get(props, 'match.params.id'))
  );

  const handleSubmit = values => {
    setSubmitting(true);
    collection.upsert(values);
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

  if (isFetching) {
    return <Spin />;
  }

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
        initialValues={!isFetching && first(client) ? first(client).toJSON() : { emails: [] }}
        handleSubmit={handleSubmit}
        submitting={submitting}
      />
    </Drawer>
  );
};

export default withI18n()(ClientFormDrawer);
