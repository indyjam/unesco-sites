"use strict";

const { parse } = require("csv-parse/sync");
const connection = require("./controller");
const fs = require("fs");

function parseCsv(filePath) {
  // Parse the CSV content: small file, keeping the readability according to the docs
  const content = fs.readFileSync(filePath);
  return parse(content, { bom: true, columns: true });
}


async function build() {
  try {
    const filePath = process.env.FILE_PATH;
    const recreateCollection = process.env.FORCE_RECREATE_COLLECTION == "true";

    let results = parseCsv(filePath);

    let collection = await connection.createCollection(recreateCollection);

    // this option prevents additional documents from being inserted if one fails
    const options = { ordered: true };
    const result = await collection.insertMany(results, options);
    console.log(`${result.insertedCount} documents were inserted`);
  } finally {
    // Ensures that the client will close when you finish/error
    await connection.close();
  }
}

build().catch(console.dir);
