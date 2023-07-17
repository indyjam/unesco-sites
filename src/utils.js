"use strict";

/****************************\
|* GeoAPI related functions *|
\****************************/
const geoApifyKey = process.env.GEOAPIFY_KEY;

async function geoFindByCoordinates(latitude, longitude) {
  var requestOptions = {
    method: "GET",
  };

  let result = await fetch(
    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${geoApifyKey}`,
    requestOptions
  ).then((response) => response.json());

  return result.features[0].properties.country;
}

async function geoFindByName(name) {
  var requestOptions = {
    method: "GET",
  };
  const encodedText = encodeURIComponent(name);
  let result = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodedText}&apiKey=${geoApifyKey}`,
    requestOptions
  ).then((response) => response.json());

  return result.features[0].properties.country;
}

module.exports = {
  geoFindByCoordinates,
  geoFindByName,
};
