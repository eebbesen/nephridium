const chai = require('chai');
const uiUtils = require('../../ui_utils.js');

const { expect } = chai;

describe('buildCustomParams', () => {
  it('removes default removes', () => {
    const params = {
      first: 'fone',
      time_column: 'created_at',
      url: 'https://a.socrata.dataset.com',
      third: 'tone',
    };

    const result = uiUtils.buildCustomParams(params);

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

    const result = uiUtils.buildCustomParams(params);

    expect(Object.keys(result).length).to.equal(1);
    expect(result.third).to.equal('tone');
  });

  it('does not remove filter params', () => {
    const params = {
      first: 'fone',
      time_column: 'created_at',
      url: 'https://a.socrata.dataset.com',
      third: 'tone',
      to_remove: 'c1,c5,first',
    };

    const result = uiUtils.buildCustomParams(params);

    expect(Object.keys(result).length).to.equal(2);
    expect(result.first).to.equal('fone');
    expect(result.third).to.equal('tone');
  });
});

describe('html', () => {
  it('no data shows message', () => {
    const result = uiUtils.html([]);

    expect(result).to.equal('\n<!DOCTYPE html>\n<html lang=\'en\'>\n<head>\n  <style>*:not(.footerElement) {\n  border-collapse: collapse;\n  padding: 5px;\n  font-family: helvetica;;\n}\n\nth {\n  text-transform: uppercase;\n  border: 2px solid black;\n  background-color: lightblue;\n}\n\ntd {\n  border: 1px solid black;\n  max-width: 20em;\n}\n\n.error {\n  text-align: center;\n  color: red;\n  font-size: 3em;\n}\n\n#download {\n  margin-right: 10em;\n}\n\n#description {\n  text-align: center;\n  padding: 0;\n}\n\nh1 {\n  margin: 0;\n}\n\nbutton {\n  border: 2px solid blue;\n  border-radius: 4px;\n  margin: 0 10px;\n}\n\nbutton:hover {\n  color: white;\n  cursor: pointer;\n  background-color: blue;\n}\n\n#footer {\n  text-align: center;\n  font-size: 1em;\n  width: 30em;\n  margin: auto;\n}\n\n#footerElementLeft {\n  float: left;\n  text-align: right;\n  /*margin: 20px 10px;*/\n  display: inline;\n}\n\n#footerElementRight {\n  float: right;\n  text-align: left;\n  /*margin: 2px 10px;*/\n  display: inline;\n}\n\n#filters * {\n  list-style-type: none;\n  margin: 0;\n  display: flex;\n  justify-content: center;\n}\n\ntable {\n  margin: 0 auto;\n}\n\n#buttons {\n  display: flex;\n  justify-content: center;\n}\n\n</style>\n  <title>Nephridium-powered page</title>\n  <link rel="shortcut icon" href="#" />\n  <link rel="shortcut icon" type="image/png" href="https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Filter_font_awesome.svg/32px-Filter_font_awesome.svg.png"/>\n</head>\n<body>\n  <div id="description">\n    <h1>\n      <a href="undefined"></a>\n    </h1>\n  </div>\n\n  <div id="buttons">\n    <button id="downloadCSV" type="button" onclick="exportTableToCSV(\'data.csv\')">Download this data for a spreadsheet</button>\n    <button id="downloadJSON" type="button" onclick="location.href=\'undefined\'">Raw JSON</button>\n    <button id="toggleFilters" type="button" onclick="toggleFilterDisplay()">Show Filters</button>\n  </div>\n  \n  <div><div class="error"><p>No records found</p><p>Please expand your search</p></div></div>\n  <div id="footer">\n    <div class="footerElement" id="footerElementLeft">nephridium version: 2.1.0</div><div id="footerElementRight" class="footerElement">Get the source code <a id="github" class="footerElement" href="https://github.com/eebbesen/nephridium">here</a></div>\n  </div>\n  \n  <script type="text/javascript">\n    // from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction exportTableToCSV(filename) {\n  const csv = [];\n  const rows = document.querySelectorAll(\'table tr\');\n\n  for (let i = 0; i < rows.length; i++) {\n    const row = []; const\n      cols = rows[i].querySelectorAll(\'td, th\');\n\n    for (let j = 0; j < cols.length; j++) {\n      row.push(cols[j].innerText);\n    }\n\n    csv.push(row.join(\',\'));\n  }\n\n  downloadCSV(csv.join(\'\\n\'), filename);\n}\n\n// from https://www.codexworld.com/export-html-table-data-to-csv-using-javascript/\nfunction downloadCSV(csv, filename) {\n  const csvFile = new Blob([csv], { type: \'text/csv\' });\n  const downloadLink = document.createElement(\'a\');\n  downloadLink.download = filename;\n  downloadLink.href = window.URL.createObjectURL(csvFile);\n  downloadLink.style.display = \'none\';\n  document.body.appendChild(downloadLink);\n\n  downloadLink.click();\n}\n\nfunction toggleFilterDisplay() {\n  const style = document.getElementById(\'filters\').style.display;\n  if (style && style == \'block\') {\n    document.getElementById(\'filters\').style.display = \'none\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Show Filters\';\n  } else {\n    document.getElementById(\'filters\').style.display = \'block\';\n    const b = document.getElementById(\'toggleFilters\').innerText = \'Hide Filters\';\n  }\n}\n\n  </script>\n</body>\n</html>');
  });
});

describe('buildTableData', () => {
  it('returns no records found when null data', () => {
    const ret = uiUtils.buildTableData(null);
    expect(ret).to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns no records found when empty data', () => {
    const ret = uiUtils.buildTableData([]);
    expect(ret).to.equal('<div class="error"><p>No records found</p><p>Please expand your search</p></div>');
  });

  it('returns properly-formatted records', () => {
    const data = {
      a: '2018-10-01 00:00:01',
      b: 2,
      d: '7T989','name_one': '2018-10-01', 'c_you_later': '3',
    };

    const ret = uiUtils.buildTableData([data]);

    const expectedHeader = '<thead><tr><th>a</th><th>b</th><th>d</th><th>name one</th><th>c you later</th></tr></thead>';
    const expectedBody = '<tbody><tr><td>2018-10-01 00:00:01</td><td>2</td><td>7T989</td><td>2018-10-01</td><td>3</td></tr></tbody>';
    expect(ret).to.equal(`<div id="data_table"><table>${expectedHeader}${expectedBody}</table></div>`);
  });
});



describe('buildFiltersDisplay', () => {
  it('does not include display_title in output', () => {
    const ret = uiUtils.buildFiltersDisplay({
      district_council: 8,
      display_title: 'A+Display+Title',
    });

    expect(ret).to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li>\n  </ul>\n</div>\n');
  });

  it('produces embeddible html', () => {
    const ret = uiUtils.buildFiltersDisplay({
      district_council: 8,
      status: 'Open',
    });

    expect(ret).to.equal('\n<div id="filters" style="display:none">\n  <h2>Filters</h2>\n  <ul>\n    <li>DISTRICT COUNCIL: 8</li><li>STATUS: open</li>\n  </ul>\n</div>\n');
  });
});

describe('getDisplayTitle', () => {
  it('handles null params', () => {
    expect(uiUtils.getDisplayTitle(null)).to.equal('');
  });

  it('handles empty params', () => {
    expect(uiUtils.getDisplayTitle({})).to.equal('');
  });

  it('handles params without display_title', () => {
    expect(uiUtils.getDisplayTitle({ some: 'thing' })).to.equal('');
  });

  it('handles params with display_title', () => {
    expect(uiUtils.getDisplayTitle({ some: 'thing', display_title: 'This+is+a+title' })).to.equal('This+is+a+title');
  });
});
