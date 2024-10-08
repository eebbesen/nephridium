import { buildCustomParams } from './ui_utils.js';
// const DEFAULT_WHERE = `1%3D1`; use if there's no date portion or filter as query is required

export function transform(json) {
  const data = [];
  json.features.forEach((record) => {
    data.push(record.attributes);
  });

  return data;
}

export function buildDateFilter(timeColumn, timeRange) {
  const lookback = timeRange && timeRange === 'w' ? 7 : 30;
  return `${timeColumn}%20%3E%20CURRENT_TIMESTAMP%20-%20INTERVAL%20%27${lookback}%27%20DAY`;
}

// assumes date range will prepend it
export function buildSearchParams(params) {
  const filteredParams = buildCustomParams(params);
  let filterString = '';
  Object.entries(filteredParams).forEach(([k, v]) => {
    filterString += `+AND+${k}%3D%27${v}%27`;
  });

  return filterString;
}

export function buildUrl(params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || null;
  const dateFilter = buildDateFilter(timeColumn, timeRange);
  const otherSearchParams = buildSearchParams(params);

  return `${baseUrl}/0/query?where=${dateFilter}${otherSearchParams}&orderByFields=${timeColumn}%20DESC&outFields=*&f=json`;
}
