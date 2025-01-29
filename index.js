require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const validUrl = require("valid-url");
const req = require("express/lib/request");
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
const urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: String,
});
const URL = mongoose.model("URL", urlSchema);

const findURL = async (original_url) => {
	return await URL.findOne({ original_url });
};

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
app.post("/api/shorturl", async (req, res) => {
	const { url: original_url } = req.body;
	if (!validUrl.isUri(original_url)) {
		res.json({ error: "invalid URL" });
	} else {
		// check if url already exists in database
		let url = await findURL(original_url);
		if (url) {
			console.log("found");
			res.json(url.short_url);
		} else {
			// shortenURL
			const urls = await URL.find();

			// write to database
			url = new URL({
				short_url: urls.length,
				original_url,
			});
			await url.save();
			console.log("saved");
			res.json({ original_url: url.original_url, short_url: url.short_url });
		}
	}
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
	const id = req.params.shorturl;
	const url = await URL.findOne({ short_url: id });
	res.json({ original_url: url.original_url });
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
