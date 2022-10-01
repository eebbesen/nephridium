const chai = require('chai');
const uiUtils = require('../../ui_utils.js');

const { expect } = chai;

describe('date functions', () => {
  it('normalizeDate strips from date', () => {
    const result = uiUtils.normalizeDate('2018-10-05T05:16:11.345Z');

    expect(result).to.equal('2018-10-05');
  });

  it('buildDate does date arithmetic for one week', () => {
    const result = uiUtils.buildDate('2018-10-05T05:16:11.345Z', 'w');

    expect(result).to.equal('2018-09-28');
  });

  it('buildDate does date arithmetic for 60 days', () => {
    const result = uiUtils.buildDate('2018-10-05T05:16:11.345Z', null);

    expect(result).to.equal('2018-08-06');
  });
});


  describe('buildCustomParams', () => {
    it('removes default removes', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
      };

      const result = uiUtils.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(2);
      expect(result.first).to.equal('fone');
      expect(result.third).to.equal('tone');
    });

    it('removes default removes and custom to_remove', () => {
      const params = {
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
        to_remove: 'c1,c5,first',
      };

      const result = uiUtils.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(1);
      expect(result.third).to.equal('tone');
    });

    it('does not remove filter params', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
        to_remove: 'c1,c5,first',
      };

      const result = uiUtils.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(2);
      expect(result.first).to.equal('fone');
      expect(result.third).to.equal('tone');
    });
  });