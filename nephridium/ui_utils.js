import fs from 'fs';
import json2html from 'node-json2html';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import {version} from './package.json';

const { render } = json2html;
const paramsToRemove = ['time_column', 'url', 'time_range', 'to_remove', 'display_title', 'provider'];

// removes some params for all calls, plus any keys in the to_remove parameter
export function buildCustomParams(params) {
  const customNo = (params.to_remove ? `,${params.to_remove}` : '').split(',');
  const rem = customNo.filter((key) => { !params[key]; });

  const data = { ...params };
  paramsToRemove.concat(rem).forEach((k) => { delete data[k]; });

  return data;
}

export function stringifyParams(params) {
  let pString = '';
  Object.keys(buildCustomParams(params)).forEach((key) => {
    const token = typeof params[key] === 'number' ? '' : '%27';
    pString += `&${key}=${token}${params[key]}${token}`;
  });

  return pString;
}

export function css() {
  return fs.readFileSync(path.resolve(__dirname, './assets/nephridium.css'), 'utf8');
}

export function javascript() {
  return Object.freeze(`
  <script type="text/javascript">
    ${fs.readFileSync(path.resolve(__dirname, './assets/nephridium.js'), 'utf8')}
  </script>`);
}

export function buildTableData(data) {
  if (data == null || data.length < 1) {
    return '<div class="error"><p>No records found</p><p>Please expand your search</p></div>';
  }

  const keys = Object.keys(data[0]);
  const tableHead = keys.map((k) => `<th>${k.replace(/_/g, ' ')}</th>`).join('');
  const tableData = keys.map((k) => `<td>\${${k}}</td>`).join('');
  const bodyDataTemplate = { '<>': 'tr', html: tableData };

  return `<div id="data_table"><table><thead><tr>${tableHead}</tr></thead><tbody>${render(data, bodyDataTemplate)}</tbody></table></div>`;
}

export function buildFiltersDisplay(params) {
  let filter = '';
  if (params) {
    delete params.display_title;

    const fs = Object.keys(params).map((k) => `<li>${k.toUpperCase().replace(/_/g, ' ')}: ${(params[k]).toString().toLowerCase()}</li>`);
    let fss = '';
    fs.forEach((f) => fss += f);
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
}

export function html(data, dataUrl, params, datasetUrl) {
  return Object.freeze(`
<!DOCTYPE html>
<html lang='en'>
<head>
  <style>${css()}</style>
  <title>Nephridium-powered page</title>
  <link rel="shortcut icon" href="#" />
  <link rel="shortcut icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_font_awesome.svg/32px-Filter_font_awesome.svg.png"/>
</head>
<body>
  <div id="description">
    <h1>
      <a href="${datasetUrl}">${getDisplayTitle(params)}</a>
    </h1>
  </div>

  <div id="buttons">
    <button id="downloadCSV" type="button" onclick="exportTableToCSV('data.csv')">Download this data for a spreadsheet</button>
    <button id="downloadJSON" type="button" onclick="location.href='${dataUrl}'">Raw JSON</button>
    <button id="toggleFilters" type="button" onclick="toggleFilterDisplay()">Show Filters</button>
  </div>
  ${buildFiltersDisplay(params)}
  <div>${buildTableData(data)}</div>
  <div id="footer">
    <div class="footerElement" id="footerElementLeft">nephridium version: 3.1.1</div><div id="footerElementRight" class="footerElement">Get the source code <a id="github" class="footerElement" href="https://github.com/eebbesen/nephridium">here</a></div>
  </div>
  ${javascript()}
</body>
</html>`);
}

export function getDisplayTitle(params) {
  if (params && params.display_title && params.display_title.length > 0) {
    return params.display_title;
  }

  return '';
}
