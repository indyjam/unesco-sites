"use strict";

const { MongoClient } = require("mongodb");
require("dotenv").config();

// TODO
// - add indexes
// - add search index
// - add geostuff

/******************************************************************************\
|* This class contains everything is needed to access the database/collection *|
|* Far from being perfect, is an hint of how I would approach things normally *|
\******************************************************************************/
class UnescoSitesConnection {
  /* construction of the connection class */
  constructor() {
    const username = encodeURIComponent(process.env.MONGODB_USERNAME);
    const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
    const cluster = process.env.MONGODB_CLUSTER;
    const database = process.env.MONGODB_DATABASE;
    let uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
    this.client = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    this.database = this.client.db(database);
    this.collectionName = process.env.MONGODB_COLLECTION;
    this.collectionInstance = null;
  }

  /* create and returns collections */
  async createCollection(recreate = false, schema = null) {
    if (recreate) {
      await this.database
        .collection(this.collectionName)
        .drop()
        .then(() => console.log("Found Collection, delete & recreate"))
        .catch((err) => console.log("Collection not present, creating it!"));
    }
    let options = schema
      ? {
          validator: { $jsonSchema: schema },
        }
      : {};
    this.collectionInstance = await this.database.createCollection(
      this.collectionName,
      options
    );
    console.log("Collection created!");
    return this.collectionInstance;
  }

  /* retrieve collections if not yet done and return it */
  async collection(recreate = false) {
    if (!this.collectionInstance) {
      this.collectionInstance = this.database.collection(this.collectionName);
    }
    return this.collectionInstance;
  }

  /* close connection */
  async close() {
    await this.client
      .close()
      .catch((err) => console.error("Error closing MongoDB connection"));
  }

  /* get list of UNESCO sites grouped by danger */
  async groupByDanger() {
    let collection = await this.collection();
    const pipeline = [
      // { $group: { _id: "$danger" } },
      { $group: { _id: "$danger", sites: { $push: "$name" } } },
    ];
    const aggCursor = collection.aggregate(pipeline);
    let res = [];
    for await (const doc of aggCursor) {
      res.push(doc);
    }
    console.log(res);
    return res;
  }

  /* get short_description related to given name */
  async getShortDescription(name) {
    let collection = await this.collection();
    let query = { name: name };
    const options = {
      projection: { _id: 0, short_description: 1 },
    };
    let res = await collection.find(query, options).toArray();
    console.log(res);
    if (res.length == 0) return {};
    return res[0];
  }

  /* get list of UNESCO sites for a specific date_inscribed range */
  async getByInscriptionRange(startRange, endRange) {
    let collection = await this.collection();
    let query = {
      date_inscribed: { $gt: startRange, $lt: endRange },
    };
    const options = {
      sort: { date_inscribed: 1 },
      //   projection: { _id: 0, Name: 1 },
    };
    let res = await collection.find(query, options).toArray();
    console.log(res);
    return res;
  }

  /* get sites of a given country */
  async getCountrySites(countryName) {
    let collection = await this.collection();
    let query = {
      country_name: countryName,
    };
    const options = {
      //   projection: { _id: 0, short_description: 1 },
    };
    let res = await collection.find(query, options).toArray();
    console.log(res);
    return res;
  }

  async getNearCoordinatesKm(latitude, longitude, radius) {
    let collection = await this.collection();
    const options = {
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius * 1000,
        },
      },
    }
    console.log("coordinates", JSON.stringify(options));
    let res = await collection
      .find(options)
      .toArray();
    console.log(res);
    return res;
  }
}

// returning the already constructed object:
// we need one and its life shall span for the entire servers' life
module.exports = new UnescoSitesConnection();
