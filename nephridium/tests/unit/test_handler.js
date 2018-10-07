'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;


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

  describe('buildCustomParams', () => {
    it('removes default removes', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone'
      };

      const result = app.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(2);
      expect(result.first).to.equal('fone');
      expect(result.third).to.equal('tone');
    });

    it('removes default removes and custom to_remove', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
        to_remove: 'c1,c5,first'
      };

      const result = app.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(1);
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
    // add .skip or comment out if you don't want to execute this live test
    it('gets data with additional filters', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = new Object();
      event.queryStringParameters = {
        url: 'https://information.stpaul.gov/resource/qtkm-psvs',
        time_column: 'request_date',
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = response.body;

      expect(response.statusCode).to.equal(200);
      expect(body).to.contain('Complaint');
    });

    it('retrns a descriptive error message when no time_column', async () => {
      const event = new Object();
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
      const event = new Object();
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
      const event = new Object();
      event.queryStringParameters = {
        district_council: '8'
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a time_column parameter. You must supply a url parameter. Make sure the url parameter is last.');
    });
  });

  describe('removeAttributes', () => {
    it('removes attributes from every row', () => {
      const data = [{name:'first', a:'1', b:'2', c:'3'},
                    {name:'first', a:'1', b:'2', c:'3'},
                    {name:'first', a:'1', b:'2', c:'3'}];

      const result = app.removeAttributes(data, 'a,b');

      result.forEach( r => expect(typeof r['a']).to.equal('undefined') && expect(typeof r['b']).to.equal('undefined'));
    });
  });
});
