import { expect } from 'chai';
import * as app from '../../app.js';
import * as socrata from '../../socrata.js';
import * as arcGis from '../../arc_gis.js';

describe('helper', () => {
  it('returns socrata with no provider param', () => {
    expect(app.helper({})).to.equal(socrata);
  });

  it('returns socrata with provider param socrata', () => {
    expect(app.helper({provider: "socrata"})).to.equal(socrata);
  });

  it('returns socrata with provider param invalid', () => {
    expect(app.helper({provider: "blah"})).to.equal(socrata);
  });

  it('returns socrata with null params', () => {
    expect(app.helper(null)).to.equal(socrata);
  });

  it('returns arcGis with provider param argGis', () => {
    expect(app.helper({provider: "arcGis"})).to.equal(arcGis);
  });
});

describe('getFilterParams', () => {
  it('returns params used to filter', () => {
    const params = {
      district_council: 8,
      request_description: 'Graffiti',
      display_title: 'This+is+a+display+title',
      time_column: 'request_date',
      to_remove: 'count,map_location_address,map_location_city,map_location_state,ward,map_location_zip,map_location,district_council,see_click_fix_website_submission',
      provider: 'arcGis',
      url: 'https://services1.arcgis.com/9meaaHE3uiba0zr8/arcgis/rest/services/Resident_Service_Requests/FeatureServer/',
    };

    const result = app.getFilterParams(params);

    expect(Object.keys(result).length).to.equal(3);
    expect(result.district_council).to.equal(8);
    expect(result.display_title).to.equal('This+is+a+display+title');
    expect(result.request_description).to.equal('Graffiti');
  });
});

describe('Tests index', () => {
  describe('removeAttributes', () => {
    it('removes stuff', () => {
      const data = [
        {
          service_number: '4753267',
          request_date: '2019-07-22T00:00:00.000',
          location: '633 CAPITOL BLVD',
          ward: '1',
          district_council: '7',
          status: 'Open',
          request_type: 'Complaint',
          request_description: 'Shut Off',
          see_click_fix_website_submission: 'No',
          map_location: { type: 'Point', coordinates: [Array] },
          count: '1',
          map_location_address: '',
          map_location_city: '',
          map_location_state: '',
          map_location_zip: '',
        },
        {
          service_number: '4753210',
          request_date: '2019-07-22T00:00:00.000',
          location: '1921 ST ANTHONY AVE',
          ward: '4',
          district_council: '13',
          status: 'Under Review',
          request_type: 'Complaint',
          request_description: 'Certificate of Occupancy',
          see_click_fix_website_submission: 'No',
          map_location: { type: 'Point', coordinates: [Array] },
          count: '1',
          map_location_address: '',
          map_location_city: '',
          map_location_state: '',
          map_location_zip: '',
        },
      ];

      const result = app.removeAttributes(data, 'count,map_location');

      expect(result.length).to.equal(2);
      expect(result[0].ward).to.equal('1');
      expect(typeof result[0].count).to.equal('undefined');
      expect(typeof data[0].count).to.equal('string');
    });

    it('removes stuff case sensitive', () => {
      const data = [
        {
          service_number: '4753267',
          request_date: '2019-07-22T00:00:00.000',
          location: '633 CAPITOL BLVD',
          ward: '1',
          district_council: '7',
          status: 'Open',
          request_type: 'Complaint',
          request_description: 'Shut Off',
          see_click_fix_website_submission: 'No',
          map_location: { type: 'Point', coordinates: [Array] },
          count: '1',
          map_location_address: '',
          map_location_city: '',
          map_location_state: '',
          map_location_zip: '',
        },
        {
          service_number: '4753210',
          request_date: '2019-07-22T00:00:00.000',
          location: '1921 ST ANTHONY AVE',
          ward: '4',
          district_council: '13',
          status: 'Under Review',
          request_type: 'Complaint',
          request_description: 'Certificate of Occupancy',
          see_click_fix_website_submission: 'No',
          map_location: { type: 'Point', coordinates: [Array] },
          count: '1',
          map_location_address: '',
          map_location_city: '',
          map_location_state: '',
          map_location_zip: '',
        },
      ];

      const result = app.removeAttributes(data, 'COUNT,MAP_location');

      expect(result.length).to.equal(2);
      expect(result[0].ward).to.equal('1');
      expect(typeof result[0].count).to.equal('string');
      expect(typeof data[0].count).to.equal('string');
    });

    it('handles no removal', () => {
      const data = [
        {
          service_number: '4753267',
          request_date: '2019-07-22T00:00:00.000',
          location: '633 CAPITOL BLVD',
          ward: '1',
          district_council: '7',
          status: 'Open',
          request_type: 'Complaint',
          request_description: 'Shut Off',
          see_click_fix_website_submission: 'No',
          map_location: { type: 'Point', coordinates: [Array] },
          count: '1',
          map_location_address: '',
          map_location_city: '',
          map_location_state: '',
          map_location_zip: '',
        },
      ];

      const result = app.removeAttributes(data, null);

      expect(result.length).to.equal(1);
      expect(data.length).to.equal(1);
      expect(data).not.to.equal(result);
    });

    it('handles no data', () => {
      const data = [];

      const result = app.removeAttributes(data, 'count,map_location');

      expect(result.length).to.equal(0);
    });
  });

  describe('buildErrors', () => {
    it('retrns a descriptive error message when no url and no time_column', () => {
      const params = {
        district_council: '8',
      };

      const response = app.buildErrors(params);

      expect(response).to.equal('You must supply a time_column parameter. You must supply a url parameter. Make sure the url parameter is last.');
    });
  });

  describe('lambdaHandler', () => {
    // add .skip or comment out if you don't want to execute this live test
    it('gets data with additional filters Socrata', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://opendata.ramseycounty.us/resource/4fqc-s7b9',
        time_column: 'date',
        csq_name: 'Navigator'
      };

      const response = await app.lambdaHandler(event, null);
      const { body, statusCode } = response;

      expect(statusCode).to.equal(200);
      expect(body).to.contain('calls abandoned');
    }).timeout(15000);

    // add .skip or comment out if you don't want to execute this live test
    it('gets data with additional filters ARC GIS', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://services1.arcgis.com/9meaaHE3uiba0zr8/arcgis/rest/services/Resident_Service_Requests/FeatureServer/',
        time_column: 'request_date',
        STATUS: 'Resolved',
        provider: 'arcGis'
      };

      const response = await app.lambdaHandler(event, null);
      const { body, statusCode } = response;

      expect(statusCode).to.equal(200);
      expect(body).to.contain('Resolved');
      expect(body).to.contain('Rubbish');
    }).timeout(15000);

    // add .skip or comment out if you don't want to execute this live test
    it('handles sending bad data to Socrata', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://xxxxxxx',
        time_column: 'request_date',
      };

      const response = await app.lambdaHandler(event, null);
      expect(response.code).to.equal('ENOTFOUND');
    });

    it('retrns a descriptive error message when no time_column', async () => {
      const event = {};
      event.queryStringParameters = {
        url: 'https://data.ramseycounty.us/resource/2yt3-vdb6',
        district_council: '8',
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a time_column parameter.');
    });

    it('retrns a descriptive error message when no url', async () => {
      const event = {};
      event.queryStringParameters = {
        time_column: 'created_at',
        district_council: '8',
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a url parameter. Make sure the url parameter is last.');
    });

    it('retrns a descriptive error message when no url and no time_column', async () => {
      const event = {};
      event.queryStringParameters = {
        district_council: '8',
      };

      const response = await app.lambdaHandler(event, null);
      const body = JSON.parse(response.body);

      expect(response.statusCode).to.equal(400);
      expect(body.message).to.equal('You must supply a time_column parameter. You must supply a url parameter. Make sure the url parameter is last.');
    });
  });

  describe('removeAttributes', () => {
    it('removes attributes from every row', () => {
      const data = [{
        name: 'first', a: '1', b: '2', c: '3',
      },
      {
        name: 'second', a: '1', b: '2', c: '3',
      },
      {
        name: 'third', a: '1', b: '2', c: '3',
      }];

      const result = app.removeAttributes(data, 'a,b');

      result.forEach(r => expect(typeof r.a).to.equal('undefined') && expect(typeof r.b).to.equal('undefined'));
    });
  });
});
