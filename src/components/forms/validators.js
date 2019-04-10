import { isArray, isEmpty, isString, includes, map } from 'lodash';

const required = value => (value ? undefined : 'This field is required');
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined;
const emails = value => {
  if (isArray(value) && !isEmpty(value)) {
    return includes(map(value, v => (isString(email(v)) ? false : true)), false)
      ? 'Invalid email address'
      : undefined;
  } else {
    return undefined;
  }
};

export { email, emails, required };
