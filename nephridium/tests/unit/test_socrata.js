const chai = require('chai');
const uiUtils = require('../../ui_utils.js');
const app = require('../../app.js');
const socrata = require('../../socrata.js');

// const dayMs = 86400000;
const weekMs = 604800000;
const thirtyDayMs = 2592000000;

const { expect } = chai;

describe('buildUrl', () => {
  it('builds url for one week', () => {
    const expectedDate = new Date(new Date() - weekMs).toISOString().slice(0,10);
    const params = {
      url: 'https://a.socrata.dataset.com/resource/abcd-efgh',
      time_range: 'w',
      time_column: 'REQUEST_DATE',
      some_param: 'xyz'
    };

    const result = socrata.buildUrl(params);

    expect(result).to.equal(`${params['url']}.json?$where=REQUEST_DATE%3E%27${expectedDate}%27&some_param=%27xyz%27&$order=REQUEST_DATE%20DESC`);
  });
});

describe('date functions', () => {
  it('normalizeDate strips from date', () => {
    const result = socrata.normalizeDate('2018-10-05T05:16:11.345Z');

    expect(result).to.equal('2018-10-05');
  });

  it('buildDate does date arithmetic for one week', () => {
    const fromDate = new Date(new Date() - weekMs);
    const expectedDateString = fromDate.toISOString().slice(0,10);
    const result = socrata.buildDateFilter('date_reported', 'w');

    expect(result).to.equal(`date_reported%3E%27${expectedDateString}%27`);
  });

  it('buildDate does date arithmetic for 60 days', () => {
    const fromDate = new Date(new Date() - (2 * thirtyDayMs));
    const expectedDateString = fromDate.toISOString().slice(0,10);
    const result = socrata.buildDateFilter('date_reported', null);

    expect(result).to.equal(`date_reported%3E%27${expectedDateString}%27`);
  });
});
