const express = require("express");
const router = express.Router();
const validUrl = require("valid-url");
const mongoose = require("mongoose");
const dns = require("dns");

const urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: String,
});
const URL = mongoose.model("URL", urlSchema);

const findURL = async (original_url) => {
	return await URL.findOne({ original_url });
};

function validateURL(url) {
	const submittedUrl = url;
	try {
		console.log("submittedUrl", submittedUrl);
		if (submittedUrl === null || submittedUrl === "") {
			return false;
		} else {
			const dnsValid = dns.lookup(submittedUrl, (err, addr) => {
				if (err || !addr) {
					return false;
				} else {
					return true;
				}
			});
			if (!dnsValid && !validUrl.isUri(submittedUrl)) {
				return false;
			} else {
				return true;
			}
		}
	} catch (error) {
		return false;
	}
}

router.post("/shorturl", async (req, res) => {
	const { url: original_url } = req.body;
	const isValid = validateURL(original_url);
	console.log("isValid", isValid);
	if (isValid) {
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

router.get("/shorturl/:shorturl", async (req, res) => {
	const id = req.params.shorturl;
	const url = await URL.findOne({ short_url: id });
	res.redirect(url.original_url);
});

module.exports = router;
