const schema = {
  bsonType: "object",
  required: [
    "name",
    "date_inscribed",
    "short_description",
    "danger",
    "location",
    "category_long",
    "category_short",
    "country_name",
    "region",
    "iso_code",
    "transboundary",
  ],
  properties: {
    name: { bsonType: "string" },
    short_description: { bsonType: "string" },
    date_inscribed: { bsonType: "int" },
    danger: { bsonType: "bool" },
    date_end: { bsonType: ["int", "null"] },
    location: {
      bsonType: "object",
      required: ["type", "coordinates"],
      properties: {
        type: {
          bsonType: "string",
          enum: ["Point"],
        },
        coordinates: {
          bsonType: ["array"],
          minItems: 2,
          maxItems: 2,
          items: [
            {
              bsonType: "double",
              minimum: -180,
              maximum: 180,
            },
            {
              bsonType: "double",
              minimum: -90,
              maximum: 90,
            },
          ],
        },
      },
    },
    area_hectares: { bsonType: ["int", "null"] },
    category_long: { bsonType: "string" },
    category_short: { bsonType: "string" },
    country_name: { bsonType: "string" },
    region: { bsonType: "string" },
    iso_code: { bsonType: "string" },
    transboundary: { bsonType: "bool" },
    rev_bis: { bsonType: "string" },
  },
};

module.exports = schema;
