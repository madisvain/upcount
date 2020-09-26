import moment from 'moment/min/moment-with-locales';

export const DEFAULT_LOCALE_KEY = 'default'

export const setDefaultDateLocale = () => {
  moment.defineLocale(DEFAULT_LOCALE_KEY,
    {
      parentLocale: 'en-US',
      longDateFormat: {
        L: 'YYYY-MM-YY',
      }
    }
  )
}

/*
 * Global locale is already set before these functions are called.
 * The date-fns or Luxon package would be preferred, but the DatePicker uses moment, so it would be tough to
 * convert formats
 */

export const formatDateString = (dateString) => {
  try {
    return moment(dateString).format('L')
  } catch (e) {
    console.log('Error while formatting date string ', e)
  }
}

export const getDatePickerFormats = (dateString) => {
  // According to antd date picker documentation we provide two values, the first is the display format, the other is the fallback parse format
  return [formatDateString(dateString), dateString]
}
