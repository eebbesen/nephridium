const chai = require('chai');
const uiUtils = require('../../ui_utils.js');
const app = require('../../app.js');
const socrata = require('../../socrata.js');

const { expect } = chai;

describe('buildUrl', () => {
  it('builds url for one week', () => {
    const expectedDate = uiUtils.buildDate(new Date().toISOString(), 'w');
    const params = {
      url: 'https://a.socrata.dataset.com/resource/abcd-efgh',
      time_range: 'w',
      time_column: 'request_date',
      some_param: 'xyz'
    };

    const result = socrata.buildUrl(params);

    expect(result).to.equal(`${params['url']}.json?$where=request_date%3E%27${expectedDate}%27&some_param=xyz&$order=request_date%20DESC`);
  });
});
