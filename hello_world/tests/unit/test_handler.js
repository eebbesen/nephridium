'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;


describe('Tests index', () => {
  describe('date functions', () => {
    it('normalizeDate strips from date', () => {
      const result = app.normalizeDate('2018-10-05T05:16:11.345Z');

      expect(result).to.equal('2018-10-05');
    });

    it('buildDate does date arithmetic', () => {
      const result = app.buildDate('2018-10-05T05:16:11.345Z', 'w');

      expect(result).to.equal('2018-09-28');
    });
  });

  describe('buildUrl', () => {
    it('builds url for one week', () => {
      const now = new Date();
      const expectedDate = app.buildDate(new Date().toISOString(), 'w');
      const params = {
        url: 'https://a.socrata.dataset.com/resource/abcd-efgh',
        time_range: 'w',
        time_column: 'request_date'
      };

      const result = app.buildUrl(params);

      expect(result).to.equal(`https://a.socrata.dataset.com/resource/abcd-efgh.json?$where=request_date%3E%27${expectedDate}%27`)
    });
  });

  describe('buildParams', () => {
    it('removes what it should', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone'
      };
      const expected = {
        first: 'fone',
        third: 'tone'
      };

      const result = app.buildParams(params);

      expect(Object.keys(result).length).to.equal(2);
      expect(result.first).to.equal('fone');
      expect(result.third).to.equal('tone');
    });
  });

  describe('buildErrors', () => {
    it('retrns a descriptive error message when no url and no time_column', () => {
      const params = {
        district_council: '8'
      };

      const response = app.buildErrors(params);

      expect(response).to.equal('You must supply a time_column parameter. You must supply a url parameter. Make sure the url parameter is last.');
    });
  });

  describe('lambdaHandler', () => {
    it('gets data with additional filters', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      event = new Object();
      event.queryStringParameters = {
        url: 'https://information.stpaul.gov/resource/qtkm-psvs',
        time_column: 'request_date',
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(200);
      Object.keys(body).forEach( k => expect(body[k].district_council).to.equal('8'));
    });

    it('retrns a descriptive error message when no time_column', async () => {
      event = new Object();
      event.queryStringParameters = {
        url: 'https://information.stpaul.gov/resource/qtkm-psvs',
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a time_column parameter.');
    });

    it('retrns a descriptive error message when no url', async () => {
      event = new Object();
      event.queryStringParameters = {
        time_column: 'created_at',
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a url parameter. Make sure the url parameter is last.');
    });

    it('retrns a descriptive error message when no url and no time_column', async () => {
      event = new Object();
      event.queryStringParameters = {
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a time_column parameter. You must supply a url parameter. Make sure the url parameter is last.');
    });
  });

});
