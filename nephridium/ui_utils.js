const fs = require('fs');
const json2html = require('node-json2html');
const path = require('path');

const releaseVersion = require('./package.json').version;

const paramsToRemove = ['time_column', 'url', 'time_range', 'to_remove', 'display_title', 'provider'];


// removes some params for all calls, plus any keys in the to_remove parameter
exports.buildCustomParams = function (params) {
  const customNo = (params.to_remove ? `,${params.to_remove}` : '').split(',');
  const rem = customNo.filter((key) => { !params[key]; });

  const data = Object.assign({}, params);
  paramsToRemove.concat(rem).forEach((k) => { delete data[k]; });

  return data;
};

exports.stringifyParams = function (params) {
  let pString = '';
  Object.keys(this.buildCustomParams(params)).forEach((key) => {
    const token = typeof params[key] === 'number' ? '' : '%27';
    pString += `&${key}=${token}${params[key]}${token}`;
  });

  return pString;
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
