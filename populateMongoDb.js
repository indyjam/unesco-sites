"use strict";

// const { parse } = require("csv-parse");
const { parse } = require("csv-parse/sync");
const connection = require("./controller");
const schema = require("./schema");
const fs = require("fs");
const MongoType_Double = require("mongodb").Double;

async function parseCsv(filePath, collection) {
  // Parse the CSV content: small file, keeping the readability according to the docs
  const content = fs.readFileSync(filePath);
  return parse(content, { bom: true, columns: true });
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
    let validatedRows = results.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([k, v]) => {
          return [k, parseValue(v, schema.properties[k].bsonType)];
        })
      )
    );
    const result = await collection.insertMany(validatedRows, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    // Ensures that the client will close when you finish/error
    await connection.close();
  }
}

build().catch(console.dir);
