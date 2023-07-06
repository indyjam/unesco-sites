"use strict";

const express = require("express");
const app = express();
const connection = require("./controller");
require("dotenv").config();

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

  let country = result.features[0].properties.country;
  let res = connection.getCountrySites(country);
  console.log(res);
  return res;
}

async function geoFindByName(text) {
  var requestOptions = {
    method: "GET",
  };
  const encodedText = encodeURIComponent(text);
  let result = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodedText}&apiKey=${geoApifyKey}`,
    requestOptions
  ).then((response) => response.json());

  let country = result.features[0].properties.country;
  let res = connection.getCountrySites(country);
  console.log(res);
  return res;
}

/****************************************\
|* Express related variables and routes *|
\****************************************/
const PORT = process.env.PORT || 4111;
const server = app.listen(
  PORT,
  console.log("Server has started at port ", PORT)
);

/* get list of UNESCO sites grouped by danger */
app.get("/groupByDanger", async (req, res) => {
  try {
    let value = await connection.groupByDanger();
    res.send(value);
  } catch (err) {
    next(err);
  }
});

/* get short_description related to given name */
app.get("/getShortDescription", async (req, res, next) => {
  let name = req.query.name;
  try {
    let value = await connection.getShortDescription(name);
    res.send(value);
  } catch (err) {
    next(err);
  }
});

/* get list of UNESCO sites for a specific date_inscribed range */
app.get("/getByInscriptionRange", async (req, res, next) => {
  // TODO: put a control on the types!
  let startRange = req.query.startRange;
  let endRange = req.query.endRange;
  if (!startRange) {
    next("startRange parameter is mandatory!");
  } else if (!endRange) {
    next("endRange parameter is mandatory!");
  } else {
    try {
      let value = await connection.getByInscriptionRange(startRange, endRange);
      res.send(value);
    } catch (err) {
      next(err);
    }
  }
});

/* get sites of a given country */
app.get("/getCountrySites", async (req, res, next) => {
  let name = req.query.name;
  if (!name) {
    next("name parameter is mandatory!");
  } else {
    try {
      let value = await connection.getCountrySites(name);
      res.send(value);
    } catch (err) {
      next(err);
    }
  }
});

/* GeoApify 1: get sites of a given country by selecting a pair of coordinates.
  For how I interpreted the request, one possibility is that the user
  select a point in a map and the application returns all the sites
  of the corresponding country */
app.get("/geoFindByCoordinates", async (req, res, next) => {
  // TODO: put a control on the types!
  let latitude = req.query.latitude;
  let longitude = req.query.longitude;
  if (!latitude) {
    next("latitude parameter is mandatory!");
  } else if (!longitude) {
    next("longitude parameter is mandatory!");
  } else {
    try {
      let value = await geoFindByCoordinates(latitude, longitude).catch((err) =>
        next(err)
      );
      res.send(value);
    } catch (err) {
      next(err);
    }
  }
});

/* GeoApify 2: get sites of a given country by selecting a name of a location in the country.
  For how I interpreted the request, a second possibility is that the user
  search for a location in a map and the application returns all the sites
  of the corresponding country */
app.get("/geoFindByName", async (req, res) => {
  let name = req.query.name;
  if (!name) {
    next("name parameter is mandatory!");
  } else {
    try {
      let value = await geoFindByName(name);
      res.send(value);
    } catch (err) {
      next(err);
    }
  }
});

/// useful for healthchecks in Cloud environments, e.g. ECS in AWS
app.get("/heartbeat", async (req, res) => {
  res.send();
});

app.get("/health", async (req, res) => {
  /// I may have misunderstood this point
  // What I did here is using a known working query
  // to test the fact that everything is working on the MongoDB side.
  // I would do the same for geoapi: in that case I would differentiate the errors
  try {
    await connection.getShortDescription("France");
    res.send("OK");
  } catch (err) {
    next(err);
  }
});

// Closing gracefully
for (let signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    console.info(`${signal} signal received.`);

    console.log("Closing MongoDB connection.");
    connection.close();

    console.log("Closing http server.");
    server.close((err) => {
      console.log("Http server closed.");
      process.exit(err ? 1 : 0);
    });
  });
