const axios = require('axios');
const tableify = require('tableify');

const dayMs = 86400000;
const weekMs = 604800000;
const thirtyDayMs = 2592000000;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 *
 */
exports.lambdaHandler = async (event, context) => {
  let response;
  try {
    const params = event.queryStringParameters;
    console.log('EVENT_QSP: ', event.queryStringParameters);

    const errors = this.buildErrors(params);
    if (errors.length > 0) {
      response = {
        statusCode: 400,
        body: JSON.stringify({ message: errors }),
      };
    } else {
      const url = this.buildUrl(params);
      const ret = await axios(url);
      const retData = this.removeAttributes(ret.data, params.to_remove);
      const modData = this.transformData(retData);
      const web = this.html(modData, url);
      response = {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: web,
      };
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

exports.buildErrors = function (params) {
  let response = '';
  if (typeof params.time_column === 'undefined') {
    response += 'You must supply a time_column parameter.';
  }
  if (typeof params.url === 'undefined') {
    if (response.length > 0) { response += ' '; }
    response += 'You must supply a url parameter. Make sure the url parameter is last.';
  }

  return response;
};

exports.buildUrl = function (params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || null;

  const dateVal = this.buildDate(new Date().toISOString(), timeRange);

  let pString = '';
  Object.keys(this.buildCustomParams(params)).forEach((key) => {
    pString += `&${key}=${params[key]}`;
  });

  return `${baseUrl}.json?$where=${timeColumn}%3E%27${dateVal}%27${pString}&$order=${timeColumn}%20DESC`;
};

// removes some params for all calls, plus any keys in the to_remove parameter
exports.buildCustomParams = function (params) {
  const data = Object.assign({}, params);
  const customNo = (params.to_remove ? `,${params.to_remove}` : '');
  const no = (`time_column,url,time_range,to_remove${customNo}`).split(',');
  no.forEach((key) => { delete data[key]; });

  return data;
};

exports.buildDate = function (date, range) {
  const initDate = new Date(`${this.normalizeDate(date)}T00:00:00.000`);
  const modifier = range === 'w' ? weekMs : thirtyDayMs;
  const endDate = new Date(initDate - modifier);

  return this.normalizeDate(endDate.toISOString());
};

exports.normalizeDate = function (date) {
  return date.substring(0, 10);
};

exports.html = function (data, socrataUrl) {
  // link addresses to google maps here

  let display = tableify(data);
  if (data.length < 1) {
    display = '<div class="error"><p>No records found</p><p>Please expand your search</p></div>'
  }

  return `
<!DOCTYPE html>
<html lang='en'>
<head>
  <style>${this.css()}</style>
  <title>Nephridium-powered page</title>
  <link rel="shortcut icon" href="#" />
</head>
<body>
  <div id="description">
    <h1>
      <a href="${socrataUrl}">City of Saint Paul Resident Service Requests</a>
    </h1>
  </div>
  <div>
    <button id="download" type="button" onclick="exportTableToCSV('data.csv')">Download this data for Excel</button>
  </div>
  <div>${display}</div>
  <div>
    <button type="button" onclick="location.href='${socrataUrl}'">Raw JSON from Socrata</button>
  </div>

  ${this.javascript()}
</body>
</html>`;
};

// probably should not mutate?
exports.removeAttributes = function (data, toRemove) {
  if (toRemove) {
    const tr = toRemove.split(',');
    data.forEach((row) => {
      tr.forEach((rm) => {
        delete row[rm];
      });
    });
  }

  return data;
};

// strip time from dates that don't have non-zero time
// remove underscores from keys
// todo: refactor to be functional and take in a list of functions to do the transforamtions
exports.transformData = function (data) {
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (typeof row[k] === 'string') {
        row[k] = row[k].replace('T00:00:00.000', '');
        if (row[k].match(/\dT\d/) && row[k].endsWith('.000')) {
          row[k] = row[k].replace('.000', '').replace('T', ' ');
        }

        if (k.includes('_')) {
          const kNew = k.replace(/_/g, ' ');
          row[kNew] = row[k];
          delete row[k];
        }

        if (k == ('location')) {
          row[k] = this.mapIt(row[k]);
        }
      }
    });
  });

  return data;
};

exports.css = function () {
  return `
* {
  border-collapse: collapse;
  padding: 5px;
  font-family: helvetica;
}

th {
  text-transform: uppercase;
  border: 2px solid black;
  background-color: lightblue;
}

td {
  border: 1px solid black;
  max-width: 20em;
}

.error {
  text-align: center;
  color: red;
  font-size: 3em;
}

#download {
  margin-right: 10em;
}

#description {
  text-align: center;
  padding: 0;
}

h1 {
  margin: 0;
}
  `
};

exports.javascript = function () {
  return `
  <script type="text/javascript">
    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
    function exportTableToCSV(filename) {
      let csv = [];
      const rows = document.querySelectorAll("table tr");

      for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++) {
          row.push(cols[j].innerText);
        }

        csv.push(row.join(","));
      }

      downloadCSV(csv.join('\\n'), filename);
    }

    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/
    function downloadCSV(csv, filename) {
      const csvFile = new Blob([csv], {type: "text/csv"});
      const downloadLink = document.createElement("a");
      downloadLink.download = filename;
      downloadLink.href = window.URL.createObjectURL(csvFile);
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);

      downloadLink.click();
    }
  </script>`
};

// expects lat/long only
exports.mapIt = function(address) {
  const URL = 'https://www.google.com/maps/place/';
  const POST = '%20Saint+Paul,+MN';
  return `<a href="${URL + encodeURIComponent(address) + POST}">${address}</a>`;
};

