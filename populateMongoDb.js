"use strict";

const { parse } = require("csv-parse");
// const { parse } = require("csv-parse/sync");
const connection = require("./controller");
const schema = require("./schema");
const fs = require("fs");
const { finished } = require("stream/promises");
const MongoType_Double = require("mongodb").Double;

async function parseCsvBare(filePath, collection) {
  // Parse the CSV content: small file, keeping the readability according to the docs
  const content = fs.readFileSync(filePath);
  return parse(content, { bom: true, columns: true });
}

async function parseCsv(filePath, collection) {
  let headers = null;
  const records = [];
  const parser = fs.createReadStream(filePath).pipe(
    parse({
      // CSV options if any
    })
  );
  parser.on("readable", function () {
    let record;
    while ((record = parser.read()) !== null) {
      if (!headers) {
        headers = record.map((v) => {
          return v.toLowerCase().replace(" ", "_");
        });
      } else {
        let row = record.reduce((acc, element, index) => {
          let key = headers[index];

          if (["latitude", "longitude"].includes(key)) {
            if (!acc.coordinates) acc["coordinates"] = {};
            acc.coordinates[key] = parseValue(
              element,
              schema.properties.coordinates.properties[key].bsonType
            );
            return acc;
          }
          return {
            ...acc,
            [key]: parseValue(element, schema.properties[key].bsonType),
          };
        }, {});
        records.push(row);
      }
    }
  });
  await finished(parser);
  return records;
}

function parseValue(val, accepted_types) {
  let type_map = {
    string: (v) => v,
    int: (v) => {
      const intValue = Number.parseInt(val);
      return Number.isNaN(intValue) ? null : intValue;
    },
    float: (v) => {
      const fValue = Number.parseFloat(val);
      return Number.isNaN(fValue) ? null : new MongoType_Double(fValue);
    },
    double: (v) => type_map.float(v),
    bool: (v) => (Number.parseInt(val) ? true : false),
  };

  if (typeof accepted_types == "string") {
    return type_map[accepted_types](val);
  } else {
    for (let t of accepted_types) {
      if (t != "null") return type_map[t](val);
    }
  }
  return null;
}

async function build() {
  try {
    const filePath = process.env.FILE_PATH;
    const recreateCollection = process.env.FORCE_RECREATE_COLLECTION == "true";

    let collection = await connection.createCollection(
      recreateCollection,
      schema
    );

    let results = await parseCsv(filePath, collection);

    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };

    /// I used this to validate the single line insertion
    // console.log(results[0]);
    // const result = await collection
    //   .insertOne(results[0], options)
    //   .catch((err) => console.log(JSON.stringify(err, null, 2)));
    // console.log(result);

    const result = await collection.insertMany(results, options);
    console.log(`${result.insertedCount} documents were inserted`);

    let iresult = await collection.createIndex({ name: 1 });
    console.log(`Index created: ${iresult}`);
    iresult = await collection.createIndex({ date_inscribed: 1 });
    console.log(`Index created: ${iresult}`);
    iresult = await collection.createIndex({ country_name: 1 });
    console.log(`Index created: ${iresult}`);

  } finally {
    // Ensures that the client will close when you finish/error
    await connection.close();
  }
}

build().catch(console.dir);
