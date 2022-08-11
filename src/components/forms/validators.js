import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { isArray, isEmpty, isNumber, isString, includes, map } from 'lodash';

const isNumeric = value => {
  return isNumber(value) || (!isEmpty(value) && !isNaN(value));
};

/* Required */
const required = value => (value ? undefined : i18n._(t`This field is required`));

/* Numeric */
const numeric = value => (isNumeric(value) ? undefined : i18n._(t`Invalid number`));

/* Email */
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? i18n._(t`Invalid email address`)
    : undefined;

/* Array of emails */
const emails = value => {
  if (isArray(value) && !isEmpty(value)) {
    return includes(
      map(value, v => (isString(email(v)) ? false : true)),
      false
    )
      ? i18n._(t`Invalid email address`)
      : undefined;
  } else {
    return undefined;
  }
};

export { email, emails, numeric, required };
