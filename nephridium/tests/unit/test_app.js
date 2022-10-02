const chai = require('chai');
const app = require('../../app.js');
const socrata = require('../../socrata.js');
const arcGis = require('../../arc_gis.js');

const { expect } = chai;

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

describe('buildTableData', () => {
  it('returns no records found when null data', () => {
    const ret = app.buildTableData(null);
    expect(ret).to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns no records found when empty data', () => {
    const ret = app.buildTableData([]);
    expect(ret).to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns properly-formatted records', () => {
    const data = {
      a: '2018-10-01 00:00:01',
      b: 2,
      d: '7T989','name_one': '2018-10-01', 'c_you_later': '3',
    };

    const ret = app.buildTableData([data]);

    const expectedHeader = '<thead><tr><th>a</th><th>b</th><th>d</th><th>name one</th><th>c you later</th></tr></thead>';
    const expectedBody = '<tbody><tr><td>2018-10-01 00:00:01</td><td>2</td><td>7T989</td><td>2018-10-01</td><td>3</td></tr></tbody>';
    expect(ret).to.equal(`<div id="data_table"><table>${expectedHeader}${expectedBody}</table></div>`);
  });
});

describe('buildFiltersDisplay', () => {
  it('does not include display_title in output', () => {
    const ret = app.buildFiltersDisplay({
      district_council: 8,
      display_title: 'A+Display+Title',
    });

    expect(ret).to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li>\n  </ul>\n</div>\n');
  });

  it('produces embeddible html', () => {
    const ret = app.buildFiltersDisplay({
      district_council: 8,
      status: 'Open',
    });

    expect(ret).to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li><li>STATUS: open</li>\n  </ul>\n</div>\n');
  });
});

describe('getDisplayTitle', () => {
  it('handles null params', () => {
    expect(app.getDisplayTitle(null)).to.equal('');
  });

  it('handles empty params', () => {
    expect(app.getDisplayTitle({})).to.equal('');
  });

  it('handles params without display_title', () => {
    expect(app.getDisplayTitle({ some: 'thing' })).to.equal('');
  });

  it('handles params with display_title', () => {
    expect(app.getDisplayTitle({ some: 'thing', display_title: 'This+is+a+title' })).to.equal('This+is+a+title');
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

describe('mapIt', () => {
  const result = app.mapIt('1600 Grand Ave');

  expect(result).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
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
        url: 'https://data.ramseycounty.us/resource/2yt3-vdb6',
        time_column: 'date',
        status: 'Open'
      };

      const response = await app.lambdaHandler(event, null);
      const { body, statusCode } = response;

      expect(statusCode).to.equal(200);
      expect(body).to.contain('beach');
    }).timeout(15000);

    // add .skip or comment out if you don't want to execute this live test
    it('gets data with additional filters ARC GIS', async () => {
      console.log('******************* I REALLY HIT A LIVE ENDPOINT!!');
      const event = {};
      event.queryStringParameters = {
        url: 'https://services1.arcgis.com/9meaaHE3uiba0zr8/arcgis/rest/services/Resident_Service_Requests/FeatureServer/',
        time_column: 'request_date',
        status: 'Open',
        provider: 'arcGis'
      };

      const response = await app.lambdaHandler(event, null);
      const { body, statusCode } = response;

      expect(statusCode).to.equal(200);
      expect(body).to.contain('Resolved');
      expect(body).to.contain('Parking');
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
      const result = app.transformData(data)[0];
      expect(result.location).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
    });
  });

  describe('html', () => {
    it('no data shows message', () => {
      const result = app.html([]);

      expect(result).to.equal('\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n  <style>*:not(.footerElement) {\n  border-collapse: collapse;\n  padding: 5px;\n  font-family: helvetica;;\n}\n\nth {\n  text-transform: uppercase;\n  border: 2px solid black;\n  background-color: lightblue;\n}\n\ntd {\n  border: 1px solid black;\n  max-width: 20em;\n}\n\n.error {\n  text-align: center;\n  color: red;\n  font-size: 3em;\n}\n\n#download {\n  margin-right: 10em;\n}\n\n#description {\n  text-align: center;\n  padding: 0;\n}\n\nh1 {\n  margin: 0;\n}\n\nbutton {\n  border: 2px solid blue;\n  border-radius: 4px;\n  margin: 0 10px;\n}\n\nbutton:hover {\n  color: white;\n  cursor: pointer;\n  background-color: blue;\n}\n\n#footer {\n  text-align: center;\n  font-size: 1em;\n  width: 30em;\n  margin: auto;\n}\n\n#footerElementLeft {\n  float: left;\n  text-align: right;\n  /*margin: 20px 10px;*/\n  display: inline;\n}\n\n#footerElementRight {\n  float: right;\n  text-align: left;\n  /*margin: 2px 10px;*/\n  display: inline;\n}\n\n#filters * {\n  list-style-type: none;\n  margin: 0;\n  display: flex;\n  justify-content: center;\n}\n\ntable {\n  margin: 0 auto;\n}\n\n#buttons {\n  display: flex;\n  justify-content: center;\n}\n\n</style>\n  <title>Nephridium-powered page</title>\n  <link rel="shortcut icon" href="#" />\n  <link rel="shortcut icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_font_awesome.svg/32px-Filter_font_awesome.svg.png"/>\n</head>\n<body>\n  <div id="description">\n    <h1>\n      <a href="undefined"></a>\n    </h1>\n  </div>\n\n  <div id="buttons">\n    <button id="downloadCSV" type="button" onclick="exportTableToCSV(\'data.csv\')">Download this data for a spreadsheet</button>\n    <button id="downloadJSON" type="button" onclick="location.href=\'undefined\'">Raw JSON from Socrata</button>\n    <button id="toggleFilters" type="button" onclick="toggleFilterDisplay()">Show Filters</button>\n  </div>\n  \n  <div><div class="error"><p>No records found</p><p>Please expand your search</p></div></div>\n  <div id="footer">\n    <div class="footerElement" id="footerElementLeft">nephridium version: 2.0.0</div><div id="footerElementRight" class="footerElement">Get the source code <a id="github" class="footerElement" href="https://github.com/eebbesen/nephridium">here</a></div>\n  </div>\n  \n  <script type="text/javascript">\n    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction exportTableToCSV(filename) {\n  const csv = [];\n  const rows = document.querySelectorAll(\'table tr\');\n\n  for (let i = 0; i < rows.length; i++) {\n    const row = []; const\n      cols = rows[i].querySelectorAll(\'td, th\');\n\n    for (let j = 0; j < cols.length; j++) {\n      row.push(cols[j].innerText);\n    }\n\n    csv.push(row.join(\',\'));\n  }\n\n  downloadCSV(csv.join(\'\\n\'), filename);\n}\n\n// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction downloadCSV(csv, filename) {\n  const csvFile = new Blob([csv], { type: \'text/csv\' });\n  const downloadLink = document.createElement(\'a\');\n  downloadLink.download = filename;\n  downloadLink.href = window.URL.createObjectURL(csvFile);\n  downloadLink.style.display = \'none\';\n  document.body.appendChild(downloadLink);\n\n  downloadLink.click();\n}\n\nfunction toggleFilterDisplay() {\n  const style = document.getElementById(\'filters\').style.display;\n  if (style && style == \'block\') {\n    document.getElementById(\'filters\').style.display = \'none\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Show Filters\';\n  } else {\n    document.getElementById(\'filters\').style.display = \'block\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Hide Filters\';\n  }\n}\n\n  </script>\n</body>\n</html>');
    });
  });
});
