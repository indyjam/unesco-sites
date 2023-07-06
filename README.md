# UNESCO REST API

## Control variables

Rename `template.env` file into`.env` and replace the entries with your settings(MongDB and GeApify credentials mainly).
If you set the flag `FORCE_RECREATE_COLLECTION="true"`, running `populateMongoDb.js` over an existing collection, will clear the existing collection and recreate it instead of giving error.

## How to populate the database

run:

- `node populateMongoDb.js`

## How to run the server with autorestart on change

The package uses `nodemon` for handling the autorestarts; just run:.

- `npm run dev`

## Notes

- MongoDB is new to me: I explored dynamoDB and I'm aware of the fact that a proper schema with indices would be needed; I went for a fast solution here, but it should not take longer for me to expand this part
- I included a postman collection for testing everything
- I also kee my .env file with secrets: bad practice, but in this case harmless and helpful for quick checks
- I normally try to refactorize the express routes using middlewares to deal with errors and common parts, in order to reduce code duplication or even avoid replicating the same code structure in multiple functions. This time I went for the fast solution, though.
