'use strict';

const axios = require('axios')
const tableify = require('tableify');

const dayMs  = 86400000;
const weekMs = 604800000;

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
    let params = null;
    console.log('EVENT_QSP: ', event.queryStringParameters);
    if (event && event.queryStringParameters){
      params = event.queryStringParameters;
    }

    // need to do because we mutate later
    const to_remove = params.to_remove

    const errors = this.buildErrors(params);
    if (errors.length > 0) {
      response  = {
        'statusCode': 400,
        'body': JSON.stringify({message: errors})
      };
    } else {
      const url = this.buildUrl(params);
      const ret = await axios(url);
      const ret_data = this.removeAttributes(ret.data, to_remove);
      const web = this.html(ret_data)
      response = {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'text/html'
        },
        'body': web
      };
    }
  } catch (err) {
      console.log(err);
      return err;
  }

  return response;
};

exports.postProcessData = function(data, custom_no) {
  let ret_data = data;

  if (no_columns) {
    const no = custom_no.split(',');
    data.forEach( d => {
      no.forEach(c => { delete d[c]; });
    });
  }

  return ret_data
}

exports.buildErrors = function(params) {
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

exports.buildUrl = function(params) {
  const baseUrl = params.url;
  const timeColumn = params.time_column;
  const timeRange = params.time_range || 'w';

  const dateVal = this.buildDate(new Date().toISOString(), timeRange);

  let pString = '';
  for (let key in this.buildCustomParams(params)) {
    pString += `&${key}=${params[key]}`;
  }

  return `${baseUrl}.json?$where=${timeColumn}%3E%27${dateVal}%27${pString}`;
};

// is this a problem that it mutates?
// a: yes, it causes us to have to store to_remove
// removes some params for all calls, plus any keys in the to_remove parameter
exports.buildCustomParams = function(params) {
  const custom_no = (params.to_remove ? ',' + params.to_remove : '');
  const no = ('time_column,url,time_range,to_remove' + custom_no).split(',');
  no.forEach(key => { delete params[key]; });
  console.log('xxxxxxx', params)

  return params;
};

exports.buildDate = function(date, range) {
  const initDate = new Date(`${this.normalizeDate(date)}T00:00:00.000`);
  let modifier = range == 'w' ? weekMs : dayMs;
  const endDate = new Date(initDate - modifier);

  return this.normalizeDate(endDate.toISOString());
}

exports.normalizeDate = function(date) {
  return date.substring(0,10);
};

exports.html = function(data) {
  const table = tableify(data);

  return `
<html>
<head><style>${this.css()}</style></head>
<body><div>${table}</div></body>
</html>`
};

// probably should not mutate?
exports.removeAttributes = function(data, toRemove) {
  if (toRemove) {
    const tr = toRemove.split(',');
    data.forEach(row => {
      tr.forEach(rm => {
        delete row[rm];
        return row;
      });
    });
  }

  return data;
};

exports.css = function() {
  return `
* {
  border-collapse: collapse;
  padding: 5px;
}
th {
  text-transform: uppercase;
  border: 2px solid black;
}

td {
  border: 1px solid black;
}
  `;
};
