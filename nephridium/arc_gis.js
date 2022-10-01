exports.transform = function (json) {
  const data = [];

  json[0]["features"].forEach((record) => {
    data.push(record["attributes"]);
  });

  return data;
};
