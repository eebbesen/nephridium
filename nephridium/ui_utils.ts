import * as json2html from 'node-json2html'
import * as fs from 'fs'
import * as path from 'path'

const releaseVersion = process.env.npm_package_version

const paramsToRemove = ['time_column', 'url', 'time_range', 'to_remove', 'display_title', 'provider']

// removes some params for all calls, plus any keys in the to_remove parameter
export function buildCustomParams (params: { [x: string]: any, to_remove: any }): object {
  const customNo = ((params.to_remove.length > 0) ? `,${params.to_remove}` : '').split(',')
  const rem = customNo.filter((key) => { return (params[key]).length > 0 })

  const data = { ...params }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  paramsToRemove.concat(rem).forEach((k) => { delete data[k] })

  return data
}

export function stringifyParams (params: { [x: string]: any, to_remove: any }): string {
  let pString = ''
  Object.keys(buildCustomParams(params)).forEach((key) => {
    const token = typeof params[key] === 'number' ? '' : '%27'
    pString += `&${key}=${token}${params[key]}${token}`
  })

  return pString
}

export function css (): string {
  return fs.readFileSync(path.resolve(__dirname, './assets/nephridium.css'), 'utf8')
}

export function javascript (): string {
  return Object.freeze(`
  <script type="text/javascript">
    ${fs.readFileSync(path.resolve(__dirname, './assets/nephridium.js'), 'utf8')}
  </script>`)
}

export function buildTableData (data: string | any[] | null): string {
  if (data == null || data.length < 1) {
    return '<div class="error"><p>No records found</p><p>Please expand your search</p></div>'
  }

  const keys = Object.keys(data[0])
  const tableHead = keys.map((k) => `<th>${k.replace(/_/g, ' ')}</th>`).join('')
  const tableData = keys.map((k) => `<td>\${${k}}</td>`).join('')
  const bodyDataTemplate = { '<>': 'tr', html: tableData }

  return `<div id="data_table"><table><thead><tr>${tableHead}</tr></thead><tbody>${json2html.render(data, bodyDataTemplate)}</tbody></table></div>`
}

export function buildFiltersDisplay (params: { [x: string]: any, display_title?: any }): string {
  let filter = ''
  if (params !== null) {
    delete params.display_title

    const fs = Object.keys(params).map((k) => `<li>${k.toUpperCase().replace(/_/g, ' ')}: ${(params[k]).toString().toLowerCase()}</li>`)
    let fss = ''
    fs.forEach((f) => { fss += f })
    filter = `
<div id="filters" style="display:none">
  <h2>Filters</h2>
  <ul>
    ${fss}
  </ul>
</div>
`
  }

  return filter
}

export function html (this: any, data: any, dataUrl: any, params: any, datasetUrl: any): string {
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
</html>`)
}

export function getDisplayTitle (params: { display_title: string | any[] }): string | any[] {
  if (params?.display_title.length > 0 && params.display_title.length > 0) {
    return params.display_title
  }

  return ''
}
