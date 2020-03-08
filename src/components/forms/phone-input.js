import { Component } from 'react';
import { Input, Select } from 'antd';
import { chain, find, map, isEmpty, toNumber } from 'lodash';
import { countries } from 'countries-list';
import { AsYouType } from 'libphonenumber-js';

const flattenedCleanedSortedPhones = chain(countries)
  .flatMap(country => country)
  .uniqBy('phone')
  .sortBy(['phone'])
  .value();

class PhoneInput extends Component {
  state = {
    initialized: false,
    prefix: '',
    number: '',
  };

  static getDerivedStateFromProps(props, state) {
    if (!state.initialized && props.value) {
      const asYouType = new AsYouType();
      asYouType.input(props.value);
      const phoneNumber = asYouType.getNumber() || {};

      let prefix = phoneNumber.countryCallingCode || '';
      let number = phoneNumber.nationalNumber || '';

      if (isEmpty(phoneNumber) && !isEmpty(props.value)) {
        const country = find(flattenedCleanedSortedPhones, ['phone', props.value.replace('+', '')]);
        if (country) {
          prefix = country.phone;
        }
      }

      return {
        initialized: true,
        prefix,
        number,
      };
    }
    return null;
  }

  handlePrefixChange = prefix => {
    this.setState({ initialized: true, prefix });
    this.triggerChange(`+${prefix}${this.state.number}`);
  };

  handleNumberChange = e => {
    if (!isNaN(toNumber(e.target.value))) {
      let number = '';
      if (e.target.value !== '') {
        number = toNumber(e.target.value);
      }
      this.setState({ initialized: true, number });
      this.triggerChange(`+${this.state.prefix}${number}`);
    }
  };

  triggerChange = value => {
    this.props.onChange(value);
  };

  render() {
    return (
      <Input.Group compact>
        <Select
          value={this.state.prefix}
          style={{ width: '25%' }}
          showSearch
          optionFilterProp="name"
          onChange={this.handlePrefixChange}
        >
          {map(flattenedCleanedSortedPhones, country => (
            <Select.Option value={country.phone} key={country.phone} name={`+${country.phone}`}>
              {`+${country.phone}`}
            </Select.Option>
          ))}
        </Select>
        <Input
          value={this.state.number}
          style={{ width: '75%' }}
          onChange={this.handleNumberChange}
        />
      </Input.Group>
    );
  }
}

export default PhoneInput;
