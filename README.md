# UNESCO REST API

This is a naive implementation of an API to query UNESCO sites.
The main goals are:

- Read the data from the given CSV file using csv-parse
- Store the data into the database and create appropriate models
- Ccreate the API endpoints:
  - Get the list of the UNESCO sites grouped by danger
  - Get the short_description related to a given name
  - Get all the UNESCO sites for a specific date_inscribed range
  - Write an API endpoint to get the UNESCO sites by country using Geoapify
  - (NEW) Write an API endpoint to get the UNESCO sites around a given set of coordinates using Geoapify
  - Finally, create a health check endpoint

## Control variables

Rename `template.env` file into`.env` and replace the entries with your settings(MongDB and GeApify credentials mainly).
If you set the flag `FORCE_RECREATE_COLLECTION="true"`, running `bin/populateMongoDb.js` over an existing collection, will clear the existing collection and recreate it instead of giving error.

## How to populate the database

run:

- `node bin/populateMongoDb.js`

## How to run the server with autorestart on change

The package uses `nodemon` for handling the autorestarts; just run:

- `npm run dev`

