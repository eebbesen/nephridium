const uiUtils = require('./ui_utils.js');

// const dayMs = 86400000;
const weekMs = 604800000;
const thirtyDayMs = 2592000000;

exports.buildUrl = function (params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || null;
  const pString = uiUtils.stringifyParams(params);

  const dateFilter = this.buildDateFilter(timeColumn, timeRange);

  return `${baseUrl}.json?$where=${dateFilter}${pString}&$order=${timeColumn}%20DESC`;
};

// no transformation needed for socrata
exports.transform = function (data) {
  return data;
};

exports.buildDateFilter = function (timeColumn, timeRange) {
  const lookback = timeRange === 'w' ? weekMs : (2 * thirtyDayMs);
  const endDate = new Date(new Date() - lookback);

  return `${timeColumn}%3E%27${this.normalizeDate(endDate.toISOString())}%27`;
};

exports.normalizeDate = function (date) {
  return date.substring(0, 10);
};
