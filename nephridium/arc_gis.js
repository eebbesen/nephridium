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

  const dateVal = uiUtils.buildDate(new Date().toISOString(), timeRange);

  return `${baseUrl}/0/query?where=${DEFAULT_WHERE}${pString}&orderByFields=${timeColumn}&outFields=*&f=json`;
};
