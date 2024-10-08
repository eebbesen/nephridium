import chai from 'chai';
import { buildCustomParams, buildFiltersDisplay, buildTableData, getDisplayTitle, html,stringifyParams } from '../../ui_utils.js';

const { expect } = chai;

describe('buildCustomParams', () => {
  it('removes default removes', () => {
    const params = {
      first: 'fone',
      time_column: 'created_at',
      url: 'https://a.socrata.dataset.com',
      third: 'tone',
    };

    const result = buildCustomParams(params);

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

    const result = buildCustomParams(params);

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

    const result = buildCustomParams(params);

    expect(Object.keys(result).length).to.equal(2);
    expect(result.first).to.equal('fone');
    expect(result.third).to.equal('tone');
  });
});

describe('html', () => {
  it('no data shows message', () => {
    const result = html([]);

    expect(result)
      .to.contain('<p>No records found</p><p>Please expand your search</p>');
  });
});

describe('buildTableData', () => {
  it('returns no records found when null data', () => {
    const ret = buildTableData(null);
    expect(ret)
      .to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns no records found when empty data', () => {
    const ret = buildTableData([]);
    expect(ret)
      .to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns properly-formatted records', () => {
    const data = {
      a: '2018-10-01 00:00:01',
      b: 2,
      d: '7T989','name_one': '2018-10-01', 'c_you_later': '3',
    };

    const ret = buildTableData([data]);

    const expectedHeader = '<thead><tr><th>a</th><th>b</th><th>d</th><th>name one</th><th>c you later</th></tr></thead>';
    const expectedBody = '<tbody><tr><td>2018-10-01 00:00:01</td><td>2</td><td>7T989</td><td>2018-10-01</td><td>3</td></tr></tbody>';
    expect(ret)
      .to.equal(`<div id="data_table"><table>${expectedHeader}${expectedBody}</table></div>`);
  });
});

describe('buildFiltersDisplay', () => {
  it('does not include display_title in output', () => {
    const ret = buildFiltersDisplay({
      district_council: 8,
      display_title: 'A+Display+Title',
    });

    expect(ret)
      .to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li>\n  </ul>\n</div>\n');
  });

  it('produces embeddible html', () => {
    const ret = buildFiltersDisplay({
      district_council: 8,
      status: 'Open',
    });

    expect(ret)
      .to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li><li>STATUS: open</li>\n  </ul>\n</div>\n');
  });
});

describe('getDisplayTitle', () => {
  it('handles null params', () => {
    expect(getDisplayTitle(null)).to.equal('');
  });

  it('handles empty params', () => {
    expect(getDisplayTitle({})).to.equal('');
  });

  it('handles params without display_title', () => {
    expect(getDisplayTitle({ some: 'thing' })).to.equal('');
  });

  it('handles params with display_title', () => {
    expect(getDisplayTitle({ some: 'thing', display_title: 'This+is+a+title' }))
      .to.equal('This+is+a+title');
  });

  describe('stringifyParams', () => {
    it('stringifiesParams with tics', () => {
      const params = {status: 'Open', latitude: -92.9966451326};
      expect(stringifyParams(params))
        .to.equal('&status=%27Open%27&latitude=-92.9966451326');
    });
  });
});
