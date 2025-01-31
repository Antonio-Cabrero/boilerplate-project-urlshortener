require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const apiRoutes = require("./routes/apiRoutes");

//DB
mongoose.connect(process.env.MONGO, {
	serverSelectionTimeoutMS: 5000,
});

const connection = mongoose.connection;
connection.on("error", console.error.bind(console, "connection error"));
connection.once("open", () => {
	console.log("Connection Successful");
});

// DB SCHEMA

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Your first API endpoint

app.use("/api", apiRoutes);

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
