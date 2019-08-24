const chai = require('chai');
const app = require('../../app.js');

const { expect } = chai;

describe('getFilterParams', () => {
  it ('returns params used to filter', () => {
    const params = {
      district_council: 8,
      request_description: 'Graffiti',
      time_column: 'request_date',
      to_remove: 'count,map_location_address,map_location_city,map_location_state,ward,map_location_zip,map_location,district_council,see_click_fix_website_submission',
      url: 'https://information.stpaul.gov/resource/qtkm-psvs'
    }

    const result = app.getFilterParams(params);

    expect(Object.keys(result).length).to.equal(2);
    expect(result['district_council']).to.equal(8);
    expect(result['request_description']).to.equal('Graffiti');
  });
});

describe('mapIt', () => {
  const result = app.mapIt('1600 Grand Ave');

  expect(result).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
});

describe('Tests index', () => {
  describe('removeAttributes', () => {
    it ('removes stuff', () => {
      const data = [
        { service_number: '4753267',
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
          map_location_zip: '' },
        { service_number: '4753210',
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
          map_location_zip: ''
        }
      ];

      const result = app.removeAttributes(data, 'count,map_location');

      expect(result.length).to.equal(2);
      expect(result[0].ward).to.equal('1');
      expect(typeof result[0].count).to.equal('undefined');
      expect(typeof data[0].count).to.equal('string');
    });

    it ('handles no removal', () => {
      const data = [
        { service_number: '4753267',
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
          map_location_zip: '' }
      ];

      const result = app.removeAttributes(data, null);

      expect(result.length).to.equal(1);
      expect(data.length).to.equal(1);
      expect(data).not.to.equal(result);
    });

    it ('handles no data', () => {
      const data = [];

      const result = app.removeAttributes(data, 'count,map_location');

      expect(result.length).to.equal(0);
    })
  });

  describe('date functions', () => {
    it('normalizeDate strips from date', () => {
      const result = app.normalizeDate('2018-10-05T05:16:11.345Z');

      expect(result).to.equal('2018-10-05');
    });

    it('buildDate does date arithmetic for one week', () => {
      const result = app.buildDate('2018-10-05T05:16:11.345Z', 'w');

      expect(result).to.equal('2018-09-28');
    });

    it('buildDate does date arithmetic for 60 days', () => {
      const result = app.buildDate('2018-10-05T05:16:11.345Z', null);

      expect(result).to.equal('2018-08-06');
    });
  });

  describe('buildUrl', () => {
    it('builds url for one week', () => {
      const expectedDate = app.buildDate(new Date().toISOString(), 'w');
      const params = {
        url: 'https://a.socrata.dataset.com/resource/abcd-efgh',
        time_range: 'w',
        time_column: 'request_date',
      };

      const result = app.buildUrl(params);

      expect(result).to.equal(`https://a.socrata.dataset.com/resource/abcd-efgh.json?$where=request_date%3E%27${expectedDate}%27&$order=request_date%20DESC`);
    });
  });

  describe ('buildCustomParams', () => {
    it('removes default removes', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
      };

      const result = app.buildCustomParams(params);

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

      const result = app.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(1);
      expect(result.third).to.equal('tone');
    });

    it ('does not remove filter params', () => {
      const params = {
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
        to_remove: 'c1,c5,first',
      };

      const result = app.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(2);
      expect(result.first).to.equal('fone');
      expect(result.third).to.equal('tone');
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
    it('gets data with additional filters', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://information.stpaul.gov/resource/qtkm-psvs',
        time_column: 'request_date',
        request_type: 'Complaint',
      };

      const response = await app.lambdaHandler(event, null);
      const { body, statusCode } = response;

      expect(statusCode).to.equal(200);
      expect(body).to.contain('Complaint');
    }).timeout(15000);

    it('handles sending bad data to Socrata', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://xxxxxxx',
        time_column: 'request_date',
      };

      const response = await app.lambdaHandler(event, null);
      expect(response.errno).to.equal('ENOTFOUND');
    });

    it('retrns a descriptive error message when no time_column', async () => {
      const event = {};
      event.queryStringParameters = {
        url: 'https://information.stpaul.gov/resource/qtkm-psvs',
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

  describe('transformData', () => {
    it('simplifies dates without timestamp', () => {
      const data = [{
        name_one: '2018-10-01T00:00:00.000',
        a: '2018-10-01T00:00:01.000',
        b: 2,
        c_you_later: '3',
        d: '7T989',
      }];

      const result = app.transformData(data)[0];

      expect(result['name one']).to.equal('2018-10-01');
      expect(result.a).to.equal('2018-10-01 00:00:01');
      expect(result.b).to.equal(2);
      expect(result['c you later']).to.equal('3');
      expect(result.d).to.equal('7T989');
    });

    it('decorates locations', () => {
      const data = [{
        name_one: '2018-10-01T00:00:00.000',
        location: '1600 Grand Ave',
      }];
      const result = app.transformData(data)[0];
      expect(result.location).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
    });
  });

  describe('html', () => {
    it('no data shows message', () => {
      const result = app.html([]);

      expect(result).to.equal(`\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n  <style>* {\n  border-collapse: collapse;\n  padding: 5px;\n  font-family: helvetica;\n}\n\nth {\n  text-transform: uppercase;\n  border: 2px solid black;\n  background-color: lightblue;\n}\n\ntd {\n  border: 1px solid black;\n  max-width: 20em;\n}\n\n.error {\n  text-align: center;\n  color: red;\n  font-size: 3em;\n}\n\n#download {\n  margin-right: 10em;\n}\n\n#description {\n  text-align: center;\n  padding: 0;\n}\n\nh1 {\n  margin: 0;\n}\n\nbutton {\n  border: 2px solid blue;\n  border-radius: 4px;\n}\n\nbutton:hover {\n  color: white;\n  cursor: pointer;\n  background-color: blue;\n}\n\n#version {\n  text-align: center;\n  font-size: 1em;\n}\n\n#filters * {\n  list-style-type: none;\n  margin: 0;\n}\n</style>\n  <title>Nephridium-powered page</title>\n  <link rel="shortcut icon" href="#" />\n  <link rel="shortcut icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_font_awesome.svg/32px-Filter_font_awesome.svg.png"/>\n</head>\n<body>\n  <div id="description">\n    <h1>\n      <a href="undefined">City of Saint Paul Resident Service Requests</a>\n    </h1>\n  </div>\n  <div>\n    <button id="downloadCSV" type="button" onclick="exportTableToCSV(\'data.csv\')">Download this data for a spreadsheet</button>\n    <button id="downloadJSON" type="button" onclick="location.href=\'undefined\'">Raw JSON from Socrata</button>\n    <button id="toggleFilters" type="button" onclick="toggleFilterDisplay()">Show Filters</button>\n  </div>\n  \n  <div><div class="error"><p>No records found</p><p>Please expand your search</p></div></div>\n  <div id="version">nephridium version: 1.10.0</div>\n  \n  <script type="text/javascript">\n    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction exportTableToCSV(filename) {\n  let csv = [];\n  const rows = document.querySelectorAll("table tr");\n\n  for (var i = 0; i < rows.length; i++) {\n    var row = [], cols = rows[i].querySelectorAll("td, th");\n\n    for (var j = 0; j < cols.length; j++) {\n      row.push(cols[j].innerText);\n    }\n\n    csv.push(row.join(","));\n  }\n\n  downloadCSV(csv.join(\'\\\\n\'), filename);\n}\n\n// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction downloadCSV(csv, filename) {\n  const csvFile = new Blob([csv], {type: "text/csv"});\n  const downloadLink = document.createElement("a");\n  downloadLink.download = filename;\n  downloadLink.href = window.URL.createObjectURL(csvFile);\n  downloadLink.style.display = "none";\n  document.body.appendChild(downloadLink);\n\n  downloadLink.click();\n}\n\nfunction toggleFilterDisplay() {\n  const style = document.getElementById(\'filters\').style.display;\n  if (style && style == \'block\') {\n    document.getElementById(\'filters\').style.display = \'none\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Show Filters\';\n  } else {\n    document.getElementById(\'filters\').style.display = \'block\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Hide Filters\';\n  }\n}\n\n  </script>\n</body>\n</html>`);
    });
  });
});
