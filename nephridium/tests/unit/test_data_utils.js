const chai = require('chai');
const data_utils = require('../../data_utils.js');

const { expect } = chai;

describe('transformDate', () => {
  it('transforms esri date to ISO string', () => {
    const ret = data_utils.transformDate(1546560000000);
    expect(ret.getTime()).to.equal(new Date('2019-01-04').getTime());
  });

  it('returns null given null', () => {
    expect(data_utils.transformDate(null)).to.be.null;
  });

  it('transforms UTC ISO string to date', () => {
    const ret = data_utils.transformDate("2022-08-30T00:00:00.000Z");
    expect(ret.getTime()).to.equal(1661817600000);
  });
});
