exports.transformDate = function (date) {
  if (null === date) return null;
  return new Date(date);
};
