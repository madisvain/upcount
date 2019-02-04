import React from 'react';
import { Form, Input, Radio, Select, Checkbox, DatePicker } from 'antd';
import { withProps } from 'recompose';
import { isString } from 'lodash';
import moment from 'moment';

import PhoneInput from './phone-input';

const makeField = Component => ({
  input,
  meta,
  children,
  hasFeedback,
  label,
  picker,
  isTags,
  emptyValue = '',
  ...rest
}) => {
  const hasError = meta.touched && meta.invalid;

  // Pickers needs moment as value
  if (picker) {
    if (isString(input.value)) {
      if (input.value) {
        input.value = moment(input.value);
      } else {
        input.value = null;
      }
    }
  }

  if (isTags) {
    if (isString(input.value)) {
      if (input.value) {
        input.value = [input.value];
      } else {
        input.value = [];
      }
    }
  }
  return (
    <Form.Item
      label={label}
      colon={false}
      validateStatus={hasError ? 'error' : 'success'}
      hasFeedback={hasFeedback && hasError}
      help={hasError && meta.error}
    >
      <Component
        {...input}
        {...rest}
        onChange={(value, option) => {
          if (typeof value === 'undefined') {
            input.onChange(emptyValue);
          } else {
            input.onChange(value);
          }
        }}
        children={children}
      />
    </Form.Item>
  );
};

export const AInput = makeField(Input);
export const APasswordInput = makeField(Input.Password);
export const ACheckbox = makeField(Checkbox);
export const ADatePicker = withProps({ picker: true })(makeField(DatePicker));
export const ADateRangePicker = withProps({ picker: true })(makeField(DatePicker.RangePicker));
export const APhoneInput = makeField(PhoneInput);
export const ASelect = makeField(Select);
export const ATags = withProps({ mode: 'tags', isTags: true })(makeField(Select));
export const ARadioGroup = makeField(Radio.Group);
export const ATextarea = makeField(Input.TextArea);