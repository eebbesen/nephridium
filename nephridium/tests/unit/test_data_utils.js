const chai = require('chai');
const dataUtils = require('../../data_utils.js');

const { expect } = chai;

describe('transformDate', () => {
  it('transforms esri date to ISO string', () => {
    const ret = dataUtils.transformDate(1546560000000);
    expect(ret.getTime()).to.equal(new Date('2019-01-04').getTime());
  });

  it('returns null given null', () => {
    expect(dataUtils.transformDate(null)).to.be.null;
  });

  it('transforms UTC ISO string to date', () => {
    const ret = dataUtils.transformDate("2022-08-30T00:00:00.000Z");
    expect(ret.getTime()).to.equal(1661817600000);
  });
});

describe('transformData', () => {
  it('simplifies dates without timestamp', () => {
    const data = [{
      name_one: '2018-10-01T00:00:00.000',
      a: '2018-10-01T00:00:01.000',
      b: 2,
      c_you_later: '3',
      d: '7T989',
    }];

    const result = dataUtils.transformData(data)[0];
    expect(result['name_one']).to.equal('2018-10-01');
    expect(result.a).to.equal('2018-10-01 00:00:01');
    expect(result.b).to.equal(2);
    expect(result['c_you_later']).to.equal('3');
    expect(result.d).to.equal('7T989');
  });

  it('decorates locations', () => {
    const data = [{
      name_one: '2018-10-01T00:00:00.000',
      location: '1600 Grand Ave',
    }];
    const result = dataUtils.transformData(data)[0];
    expect(result.location).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
  });

  it('changes timestamp into date', () => {
    const data = [{
      name_one: '2018-10-01T00:00:00.000',
      a: '2018-10-01T00:00:01.000',
      b: 2,
      c_you_later: '3',
      d: '7T989',
      e: 1663891200000
    }];

    const result = dataUtils.transformData(data)[0];
    expect(result.e).to.equal(new Date(1663891200000).toISOString().slice(0,10));
  });
});

describe('mapIt', () => {
  const result = dataUtils.mapIt('1600 Grand Ave');

  expect(result).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
});

