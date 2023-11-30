exports.transformDate = function (date) {
  if (date === null) return null
  return new Date(date)
}

// strip time from dates that don't have non-zero time
// todo: refactor to be functional and take in a list of functions to do the transforamtions
exports.transformData = function (data) {
  data.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (typeof row[k] === 'number') {
        if (row[k].toString().length === 13) {
          row[k] = new Date(row[k]).toISOString()
        }
      }

      if (typeof row[k] === 'string') {
        row[k] = row[k].replace(/T00:00:00.000Z?/, '')
        if (row[k].match(/\dT\d/) && row[k].endsWith('.000')) {
          row[k] = row[k].replace(/\.000Z?/, '')
          row[k] = row[k].replace('T', ' ')
        }

        if (k == ('location')) {
          row[k] = this.mapIt(row[k])
        }
      }
    })
  })

  return data
}

// expects lat/long only
exports.mapIt = function (address) {
  const URL = 'https://www.google.com/maps/place/'
  const POST = '%20Saint+Paul,+MN'
  return `<a href="${URL + encodeURIComponent(address) + POST}">${address}</a>`
}
