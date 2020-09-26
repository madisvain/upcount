// date-fns package would be preferred, but the DatePicker uses moment, so it would be tough to convert formats
import moment from 'moment'

const DateFormats = {
  defaultViewFormat: 'YYYY-MM-DD',
  parseFormat: 'YYYY-MM-DD'
}

export const getDatePickerFormats = (dateFormat) => {
  // According to antd date picker documentation we provide two values, the first is the display format, the other is the fallback parse format
  return [dateFormat ? dateFormat : DateFormats.defaultViewFormat, DateFormats.parseFormat]
}

export const formatDateString = (dateString, dateFormat) => {
  try {
    return moment(dateString).format(dateFormat ? dateFormat : DateFormats.defaultViewFormat)
  } catch (e) {
    console.log('Error while formatting date string ', e)
  }
}
