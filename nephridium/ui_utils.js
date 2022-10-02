const paramsToRemove = ['time_column', 'url', 'time_range', 'to_remove', 'display_title'];


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
    pString += `&${key}=${params[key]}`;
  });

  return pString;
};
