// const dayMs = 86400000;
const weekMs = 604800000;
const thirtyDayMs = 2592000000;
const paramsToRemove = ['time_column', 'url', 'time_range', 'to_remove', 'display_title'];


// removes some params for all calls, plus any keys in the to_remove parameter
exports.buildCustomParams = function (params) {
  const customNo = (params.to_remove ? `,${params.to_remove}` : '').split(',');
  const rem = customNo.filter((key) => { !params[key]; });

  const data = Object.assign({}, params);
  paramsToRemove.concat(rem).forEach((k) => { delete data[k]; });

  return data;
};

exports.stringifyParams = function (params) {
  let pString = '';
  Object.keys(this.buildCustomParams(params)).forEach((key) => {
    pString += `&${key}=${params[key]}`;
  });

  return pString;
};

exports.buildDate = function (date, range) {
  const initDate = new Date(`${this.normalizeDate(date)}T00:00:00.000`);
  const modifier = range === 'w' ? weekMs : (2 * thirtyDayMs);
  const endDate = new Date(initDate - modifier);

  return this.normalizeDate(endDate.toISOString());
};

exports.normalizeDate = function (date) {
  return date.substring(0, 10);
};
