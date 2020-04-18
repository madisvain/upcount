import { Component } from 'react';
import { assignIn } from 'lodash';

import PouchDB from 'pouchdb';
import router from 'umi/router';

import db from '../db';
import { OrganizationContext } from './contexts';
import { details } from '../services/organizations';

class OrganizationProvider extends Component {
  state = {
    organization: {},
  };

  setOrganization = organization => {
    this.setState({ organization });
    localStorage.setItem('organization', organization._id);
    router.push({
      pathname: '/invoices',
    });

    if (localStorage.getItem('email') && localStorage.getItem('token')) {
      this.startSync(organization);
    }
  };

  startSync = organization => {
    // CouchDB replication
    const couchDB = new PouchDB(`https://couchdb.upcount.app/organization-${organization._id}`, {
      auth: {
        username: localStorage.getItem('email'),
        password: localStorage.getItem('token'),
      },
    });

    db.sync(couchDB, {
      live: true,
      retry: true,
      filter: doc => {
        return doc.organization === organization._id || doc._id === organization._id;
      },
    })
      .on('change', function(change) {
        console.log('Change:', change);
        // Update syncedAt timestamps
        const syncedAt = JSON.parse(localStorage.getItem('syncedAt')) || {};
        localStorage.setItem(
          'syncedAt',
          JSON.stringify(assignIn(syncedAt, { [organization._id]: new Date() }))
        );
      })
      .on('paused', function(info) {
        console.log('Sync paused:', info);
      })
      .on('active', function(info) {
        console.log('Sync active:', info);
      })
      .on('error', function(err) {
        console.log('Sync error:', err);
      });
  };

  componentDidMount = async () => {
    if (localStorage.getItem('organization')) {
      const organization = await details(localStorage.getItem('organization'));
      this.setState({ organization });

      if (localStorage.getItem('email') && localStorage.getItem('token')) {
        this.startSync(organization);
      }
    }
  };

  render() {
    const { children } = this.props;

    return (
      <OrganizationContext.Provider
        value={{
          state: this.state,
          setOrganization: this.setOrganization,
        }}
      >
        {children}
      </OrganizationContext.Provider>
    );
  }
}

export default OrganizationProvider;
