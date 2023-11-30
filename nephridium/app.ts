import axios from 'axios'

import * as socrata from './socrata'
import * as arcGis from './arc_gis'
import { html } from './ui_utils'
import * as DataUtils from './data_utils'

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
export async function lambdaHandler (this: any, event: { queryStringParameters: any }, _context: any): Promise<any> {
  let response
  try {
    const params = event.queryStringParameters
    console.log('EVENT_QSP: ', event.queryStringParameters)

    const errors = this.buildErrors(params)
    if (errors.length > 0) {
      response = {
        statusCode: 400,
        body: JSON.stringify({ message: errors })
      }
    } else {
      const help = helper(params)
      const url = help.buildUrl(params)
      console.log('URL', url)
      const ret = await axios(url)
      const transformedData = help.transform(ret.data)
      const retData = this.removeAttributes(transformedData, params.to_remove)
      const modData = DataUtils.transformData(retData) // , helper)
      const filterParams = this.getFilterParams(params)
      const web = html(modData, url, filterParams, params.url)
      response = {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: web
      }
    }
  } catch (err: any) {
    console.log(err)
    return err
  }

  return response
}

export function buildErrors (params: { time_column: any, url: any }): any {
  let response = ''
  if (typeof params.time_column === 'undefined') {
    response += 'You must supply a time_column parameter.'
  }
  if (typeof params.url === 'undefined') {
    if (response.length > 0) { response += ' ' }
    response += 'You must supply a url parameter. Make sure the url parameter is last.'
  }

  return response
}

// arcGis or Socrata
export function helper (params: { provider: string }): any {
  return ((params?.provider).length > 0) && params.provider === 'arcGis' ? arcGis : socrata
}

// return object with only query filter params
export function getFilterParams (params: any): any {
  const p = { ...params }

  delete p.to_remove
  delete p.time_column
  delete p.url
  delete p.provider

  return p
}

export function removeAttributes (data: any, toRemove: string): any {
  const d = JSON.parse(JSON.stringify(data))
  if (toRemove.length > 0) {
    const tr = toRemove.split(',')
    d.forEach((row: Record<string, any>) => {
      tr.forEach((rm: string | number) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete row[rm]
      })
    })
  }

  return d
}
