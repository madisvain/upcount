import { Component } from 'react';
import router from 'umi/router';

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
  };

  componentDidMount = async () => {
    if (localStorage.getItem('organization')) {
      const organization = await details(localStorage.getItem('organization'));
      this.setState({ organization });
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
