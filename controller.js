"use strict";

const { MongoClient } = require("mongodb");
require("dotenv").config();

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
    this.client = new MongoClient(uri);
    this.database = this.client.db(database);
    this.collectionName = process.env.MONGODB_COLLECTION;
    this.collectionInstance = null;
  }

  /* create and returns collections */
  async createCollection(recreate = false) {
    if (recreate) {
      try {
        this.database.collection(this.collectionName).drop();
        console.info("Found Collection, delete & recreate");
      } catch (err) {
        console.info("Collection not present, creating it!");
      }
    }
    this.collectionInstance = await this.database.createCollection(
      this.collectionName
    );
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
      //   { $group: { _id: "$danger" } },
      { $group: { _id: "$danger", sites: { $push: "$Name" } } },
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
    let query = { Name: name };
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
      date_inscribed: { $gt: `${startRange}`, $lt: `${endRange}` },
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
      "Country name": countryName,
    };
    const options = {
      //   projection: { _id: 0, short_description: 1 },
    };
    let res = await collection.find(query, options).toArray();
    console.log(res);
    return res;
  }
}

// returning the already constructed object: 
// we need one and its life shall span for the entire servers' life
module.exports = new UnescoSitesConnection();
