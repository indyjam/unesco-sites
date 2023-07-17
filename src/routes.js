"use strict";

const connection = require("./controller");
const utils = require("./utils");
require("dotenv").config();

/****************************************\
|* Express related variables and routes *|
\****************************************/

module.exports = function (app) {
  /* get list of UNESCO sites grouped by danger */
  app.get("/groupByDanger", async (req, res, next) => {
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
    let startRange = Number.parseInt(req.query.startRange);
    let endRange = Number.parseInt(req.query.endRange);
    if (!startRange) {
      next("startRange parameter is mandatory!");
    } else if (!endRange) {
      next("endRange parameter is mandatory!");
    } else {
      try {
        let value = await connection.getByInscriptionRange(
          startRange,
          endRange
        );
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
    let latitude = Number.parseInt(req.query.latitude);
    let longitude = Number.parseInt(req.query.longitude);
    if (!latitude) {
      next("latitude parameter is mandatory!");
    } else if (!longitude) {
      next("longitude parameter is mandatory!");
    } else {
      try {
        let country = await utils.geoFindByCoordinates(latitude, longitude);
        console.log("AAAAA", country);
        let value = await connection.getCountrySites(country);
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
  app.get("/geoFindByName", async (req, res, next) => {
    let name = req.query.name;
    if (!name) {
      next("name parameter is mandatory!");
    } else {
      try {
        let country = await utils.geoFindByName(name);
        let value = await connection.getCountrySites(country);
        res.send(value);
      } catch (err) {
        next(err);
      }
    }
  });

  /* get sites in a radius from a specified set of coorindates */
  app.get("/getNearCoordinatesKm", async (req, res, next) => {
    let latitude = Number.parseFloat(req.query.latitude);
    let longitude = Number.parseFloat(req.query.longitude);
    let radius = Number.parseInt(req.query.radius);
    if (!latitude) {
      next("latitude parameter is mandatory!");
    } else if (!longitude) {
      next("longitude parameter is mandatory!");
    } else if (!radius) {
      next("radius parameter is mandatory!");
    } else {
      try {
        let value = await connection.getNearCoordinatesKm(
          latitude,
          longitude,
          radius
        );
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

  app.get("/health", async (req, res, next) => {
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

  // Endpoint not found (404)
  app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  });
};
