const chai = require('chai');
const app = require('../../app.js');

const { expect } = chai;

describe('mapIt', () => {
  const result = app.mapIt('1600 Grand Ave');

  expect(result).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
});

describe('Tests index', () => {
  describe('date functions', () => {
    it('normalizeDate strips from date', () => {
      const result = app.normalizeDate('2018-10-05T05:16:11.345Z');

      expect(result).to.equal('2018-10-05');
    });

    it('buildDate does date arithmetic for one week', () => {
      const result = app.buildDate('2018-10-05T05:16:11.345Z', 'w');

      expect(result).to.equal('2018-09-28');
    });

    it('buildDate does date arithmetic for 30 days', () => {
      const result = app.buildDate('2018-10-05T05:16:11.345Z', null);

      expect(result).to.equal('2018-09-05');
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

  describe('buildCustomParams', () => {
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
        first: 'fone',
        time_column: 'created_at',
        url: 'https://a.socrata.dataset.com',
        third: 'tone',
        to_remove: 'c1,c5,first',
      };

      const result = app.buildCustomParams(params);

      expect(Object.keys(result).length).to.equal(1);
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
      expect(response['errno']).to.equal('ENOTFOUND');
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
        d: '7T989'
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
        location: '1600 Grand Ave'
      }];
      const result = app.transformData(data)[0];
      expect(result['location']).to.equal('<a href="https://www.google.com/maps/place/1600%20Grand%20Ave%20Saint+Paul,+MN">1600 Grand Ave</a>');
    });
  });

  describe('html', () => {
    it('no data shows message', () => {
      const result = app.html([]);

      expect(result).to.equal('\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n  <style>\n* {\n  border-collapse: collapse;\n  padding: 5px;\n  font-family: helvetica;\n}\n\nth {\n  text-transform: uppercase;\n  border: 2px solid black;\n  background-color: lightblue;\n}\n\ntd {\n  border: 1px solid black;\n  max-width: 20em;\n}\n\n.error {\n  text-align: center;\n  color: red;\n  font-size: 3em;\n}\n\n#download {\n  margin-right: 10em;\n}\n\n#description {\n  text-align: center;\n  padding: 0;\n}\n\nh1 {\n  margin: 0;\n}\n  </style>\n  <title>Nephridium-powered page</title>\n  <link rel="shortcut icon" href="#" />\n</head>\n<body>\n  <div id="description">\n    <h1>\n      <a href="undefined">City of Saint Paul Resident Service Requests</a>\n    </h1>\n  </div>\n  <div>\n    <button id="download" type="button" onclick="exportTableToCSV(\'data.csv\')">Download this data for Excel</button>\n  </div>\n  <div><div class="error"><p>No records found</p><p>Please expand your search</p></div></div>\n  <div>\n    <button type="button" onclick="location.href=\'undefined\'">Raw JSON from Socrata</button>\n  </div>\n\n  \n  <script type="text/javascript">\n    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\n    function exportTableToCSV(filename) {\n      let csv = [];\n      const rows = document.querySelectorAll("table tr");\n\n      for (var i = 0; i < rows.length; i++) {\n        var row = [], cols = rows[i].querySelectorAll("td, th");\n\n        for (var j = 0; j < cols.length; j++) {\n          row.push(cols[j].innerText);\n        }\n\n        csv.push(row.join(","));\n      }\n\n      downloadCSV(csv.join(\'\\n\'), filename);\n    }\n\n    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\n    function downloadCSV(csv, filename) {\n      const csvFile = new Blob([csv], {type: "text/csv"});\n      const downloadLink = document.createElement("a");\n      downloadLink.download = filename;\n      downloadLink.href = window.URL.createObjectURL(csvFile);\n      downloadLink.style.display = "none";\n      document.body.appendChild(downloadLink);\n\n      downloadLink.click();\n    }\n  </script>\n</body>\n</html>');
    });
  });
});
