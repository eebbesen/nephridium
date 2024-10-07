import { stringifyParams } from './ui_utils.js';

// const dayMs = 86400000;
const weekMs = 604800000;
const thirtyDayMs = 2592000000;


export function normalizeDate(date) {
  return date.substring(0, 10);
};

export function buildDateFilter(timeColumn, timeRange) {
  const lookback = timeRange === 'w' ? weekMs : (2 * thirtyDayMs);
  const endDate = new Date(new Date() - lookback);

  return `${timeColumn}%3E%27${normalizeDate(endDate.toISOString())}%27`;
};

export function buildUrl(params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || null;
  const pString = stringifyParams(params);

  const dateFilter = buildDateFilter(timeColumn, timeRange);

  return `${baseUrl}.json?$where=${dateFilter}${pString}&$order=${timeColumn}%20DESC`;
};

// no transformation needed for socrata
export function transform(data) {
  return data;
};


