const uiUtils = require('./ui_utils.js');
const DEFAULT_WHERE = `1%3D1`;

exports.transform = function (json) {
  const data = [];
  json["features"].forEach((record) => {
    data.push(record["attributes"]);
  });

  return data;
};

exports.buildUrl = function (params) {
  const baseUrl = params.url;
  const timeColumn = params['time_column'];
  const timeRange = params['time_range'] || null;
  const pString = uiUtils.stringifyParams(params);

  const dateFilter = this.buildDateFilter(timeColumn, timeRange);

  return `${baseUrl}/0/query?where=${dateFilter}${pString}&orderByFields=${timeColumn}%20DESC&outFields=*&f=json`;
};

exports.buildDateFilter = function(timeColumn, timeRange) {
  const lookback = (timeRange && timeRange === 'w') ? 7 : 30;
  return `${timeColumn}%20%3E%20CURRENT_TIMESTAMP%20-%20INTERVAL%20%27${lookback}%27%20DAY`;
};
