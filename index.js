"use strict";

// loading environments
require("dotenv").config();
// creating express framework app
const express = require("express");
const app = express();
// loading routes
require("./src/routes")(app);


// starting the app
const PORT = process.env.PORT || 4111;
const server = app.listen(
  PORT,
  console.log("Server has started at port ", PORT)
);

// Closing gracefully
for (let signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    console.info(`${signal} signal received.`);

    console.log("Closing MongoDB connection.");
    require("./src/controller").close();

    console.log("Closing http server.");
    server.close((err) => {
      console.log("Http server closed.");
      process.exit(err ? 1 : 0);
    });
  });
