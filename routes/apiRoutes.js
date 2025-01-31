const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: String,
});
const URL = mongoose.model("URL", urlSchema);

const findURL = async (original_url) => {
	return await URL.findOne({ original_url });
};

router.post("/shorturl", async (req, res) => {
	try {
		const { url: original_url } = req.body;
		console.log(original_url);
		if (!validUrl.isUri(original_url)) {
			return res.json({ error: "invalid url" });
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
	} catch (err) {
		return res.json({ error: "invalid url" });
	}
});

router.get("/shorturl/:shorturl", async (req, res) => {
	const id = req.params.shorturl;
	const url = await URL.findOne({ short_url: id });
	res.redirect(url.original_url);
});

module.exports = router;
