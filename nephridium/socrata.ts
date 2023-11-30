import * as UiUtils from './ui_utils.js'

// const dayMs = 86400000;
const weekMs = 604800000
const thirtyDayMs = 2592000000

export function buildUrl (params: { url: any, time_column: any, time_range: string, to_remove: any }): string {
  const baseUrl = params.url
  const timeColumn = params.time_column
  const timeRange = params.time_range ?? null
  const pString = UiUtils.stringifyParams(params)

  const dateFilter = buildDateFilter(timeColumn, timeRange)

  return `${baseUrl}.json?$where=${dateFilter}${pString}&$order=${timeColumn}%20DESC`
}

// no transformation needed for socrata
export function transform (data: any): any {
  return data
}

export function buildDateFilter (timeColumn: any, timeRange: string): string {
  const lookback = timeRange === 'w' ? weekMs : (2 * thirtyDayMs)
  const endDate: any = (Date.now() - lookback)

  return `${timeColumn}%3E%27${normalizeDate(endDate.toISOString())}%27`
}

export function normalizeDate (date: string): string {
  return date.substring(0, 10)
}
