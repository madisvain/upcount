import { Component } from 'react';
import { Input, Select } from 'antd';
import { get, chain, map, memoize } from 'lodash';
import { countries } from 'countries-list';
import { parsePhoneNumberFromString, AsYouType } from 'libphonenumber-js';

const flattenedCleanedSortedPhones = chain(countries)
  .flatMap(country => country)
  .uniqBy('phone')
  .sortBy(['phone'])
  .value();

class PhoneInput extends Component {
  fromRepresentation = memoize(value => {
    const phoneNumber = parsePhoneNumberFromString(value);
    if (phoneNumber) {
      return phoneNumber;
    } else {
      const asYouType = new AsYouType();
      asYouType.input(value);
      const parsedNumber = asYouType.getNumber() || {};
      return {
        countryCallingCode: parsedNumber.countryCallingCode || '372',
        nationalNumber: parsedNumber.nationalNumber || '',
      };
    }
  });

  toRepresentation = (prefix, value) => {
    return `+${prefix}${value}`;
  };

  handlePrefixChange = prefix => {
    const value = get(this.props, 'value', '');
    const parsedValue = this.fromRepresentation(value);
    this.triggerChange(this.toRepresentation(prefix, parsedValue.nationalNumber));
  };

  handleNumberChange = e => {
    const number = parseInt(e.target.value || '');
    if (Number.isNaN(number)) {
      return;
    }
    const value = get(this.props, 'value', '');
    const parsedValue = this.fromRepresentation(value);
    this.triggerChange(this.toRepresentation(parsedValue.countryCallingCode, number));
  };

  triggerChange = value => {
    this.props.onChange(value);
  };

  render() {
    const { value } = this.props;
    const parsedValue = this.fromRepresentation(value);

    return (
      <Input.Group compact>
        <Select
          value={parsedValue.countryCallingCode}
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
          value={parsedValue.nationalNumber}
          style={{ width: '75%' }}
          onChange={this.handleNumberChange}
        />
      </Input.Group>
    );
  }
}

export default PhoneInput;
