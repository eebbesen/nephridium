const uiUtils = require('./ui_utils.js');

exports.buildUrl = function (params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || null;
  const pString = uiUtils.stringifyParams(params);

  const dateVal = uiUtils.buildDate(new Date().toISOString(), timeRange);

  return `${baseUrl}.json?$where=${timeColumn}%3E%27${dateVal}%27${pString}&$order=${timeColumn}%20DESC`;
};

// no transformation needed for socrata
exports.transform = function(data) {
  return data;
};