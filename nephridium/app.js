const axios = require('axios');
const json2html = require('node-json2html');
const fs = require('fs');
const path = require('path');

const socrata = require('./socrata.js');
const arcGis = require('./arc_gis.js');

const releaseVersion = require('./package.json').version;

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
exports.lambdaHandler = async (event, _context) => {
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
      const helper = this.helper(params);
      const url = helper.buildUrl(params);
      console.log('URL', url);
      const ret = await axios(url);
      const transformedData = helper.transform(ret.data);
      const retData = this.removeAttributes(transformedData, params.to_remove);
      const modData = this.transformData(retData, helper);
      const filterParams = this.getFilterParams(params);
      const web = this.html(modData, url, filterParams, params.url);
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

// arcGis or Socrata
exports.helper = function (params) {
  return params && params['provider'] && params['provider'] === 'arcGis' ? arcGis : socrata;
}

exports.buildTableData = function (data) {
  if (data == null || data.length < 1) {
    return '<div class="error"><p>No records found</p><p>Please expand your search</p></div>';
  }

  const keys = Object.keys(data[0]);
  const tableHead = keys.map(k => `<th>${k.replace(/_/g," ")}</th>`).join('');
  const tableData = keys.map(k => `<td>\${${k}}</td>`).join('');
  const bodyDataTemplate = { '<>': 'tr', html: tableData };

  return `<div id="data_table"><table><thead><tr>${tableHead}</tr></thead><tbody>${json2html.transform(data, bodyDataTemplate)}</tbody></table></div>`;
};

exports.buildFiltersDisplay = function (params) {
  let filter = '';
  if (params) {
    delete params.display_title;

    const fs = Object.keys(params).map(k => `<li>${k.toUpperCase().replace(/_/g, ' ')}: ${(params[k]).toString().toLowerCase()}</li>`);
    let fss = '';
    fs.forEach(f => fss += f);
    filter = `
<div id="filters" style="display:none">
  <h2>Filters</h2>
  <ul>
    ${fss}
  </ul>
</div>
`;
  }

  return filter;
};

exports.html = function (data, dataUrl, params, datasetUrl) {
  return Object.freeze(`
<!DOCTYPE html>
<html lang='en'>
<head>
  <style>${this.css()}</style>
  <title>Nephridium-powered page</title>
  <link rel="shortcut icon" href="#" />
  <link rel="shortcut icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_font_awesome.svg/32px-Filter_font_awesome.svg.png"/>
</head>
<body>
  <div id="description">
    <h1>
      <a href="${datasetUrl}">${this.getDisplayTitle(params)}</a>
    </h1>
  </div>

  <div id="buttons">
    <button id="downloadCSV" type="button" onclick="exportTableToCSV('data.csv')">Download this data for a spreadsheet</button>
    <button id="downloadJSON" type="button" onclick="location.href='${dataUrl}'">Raw JSON</button>
    <button id="toggleFilters" type="button" onclick="toggleFilterDisplay()">Show Filters</button>
  </div>
  ${this.buildFiltersDisplay(params)}
  <div>${this.buildTableData(data)}</div>
  <div id="footer">
    <div class="footerElement" id="footerElementLeft">nephridium version: ${releaseVersion}</div><div id="footerElementRight" class="footerElement">Get the source code <a id="github" class="footerElement" href="https://github.com/eebbesen/nephridium">here</a></div>
  </div>
  ${this.javascript()}
</body>
</html>`);
};

exports.getDisplayTitle = function (params) {
  if (params && params.display_title && params.display_title.length > 0) {
    return params.display_title;
  }

  return '';
};

// return object with only query filter params
exports.getFilterParams = function (params) {
  const p = Object.assign({}, params);

  delete p.to_remove;
  delete p.time_column;
  delete p.url;
  delete p.provider;

  return p;
};

exports.removeAttributes = function (data, toRemove) {
  const d = JSON.parse(JSON.stringify(data));
  if (toRemove) {
    const tr = toRemove.split(',');
    d.forEach((row) => {
      tr.forEach((rm) => {
        delete row[rm];
      });
    });
  }

  return d;
};

// strip time from dates that don't have non-zero time
// todo: refactor to be functional and take in a list of functions to do the transforamtions
exports.transformData = function (data) {
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (typeof row[k] === 'number') {
        if (row[k].toString().length === 13) {
          row[k] = new Date(row[k]).toISOString();
        }
      }

      if (typeof row[k] === 'string') {
        row[k] = row[k].replace(/T00:00:00.000Z?/, '');
        if (row[k].match(/\dT\d/) && row[k].endsWith('.000')) {
          row[k] = row[k].replace(/\.000Z?/, '')
          row[k] = row[k].replace('T', ' ');
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
  return fs.readFileSync(path.resolve(__dirname, './assets/nephridium.css'), 'utf8');
};

exports.javascript = function () {
  return Object.freeze(`
  <script type="text/javascript">
    ${fs.readFileSync(path.resolve(__dirname, './assets/nephridium.js'), 'utf8')}
  </script>`);
};

// expects lat/long only
exports.mapIt = function (address) {
  const URL = 'https://www.google.com/maps/place/';
  const POST = '%20Saint+Paul,+MN';
  return `<a href="${URL + encodeURIComponent(address) + POST}">${address}</a>`;
};
