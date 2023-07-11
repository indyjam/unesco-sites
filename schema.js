
const schema = {
    bsonType: "object",
    required: [
      "Name",
      "date_inscribed",
      "short_description",
      "danger",
      "longitude",
      "latitude",
      "area_hectares",
      "category_long",
      "category_short",
      "Country name",
      "Region",
      "iso_code",
      "transboundary",
    ],
    properties: {
      Name: { bsonType: "string" },
      short_description: { bsonType: "string" },
      date_inscribed: { bsonType: "int" },
      danger: { bsonType: "bool" },
      date_end: { bsonType:  ["int", "null"] },
      longitude: { bsonType: "double" },
      latitude: { bsonType: "double" },
      area_hectares: { bsonType: ["int", "null"] },
      category_long: { bsonType: "string" },
      category_short: { bsonType: "string" },
      "Country name": { bsonType: "string" },
      Region: { bsonType: "string" },
      iso_code: { bsonType: "string" },
      transboundary: { bsonType: "bool" },
      rev_bis: { bsonType: "string" },
    },
  };

  module.exports = schema;