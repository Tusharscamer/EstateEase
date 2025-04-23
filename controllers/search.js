const Listing = require("../models/listing.js");

module.exports.searchListing = async (req, res) => {
    const { query } = req.query;
    let filters = {};

    if (query) {
        filters.$or = [
            { title: { $regex: query, $options: "i" } },
            { location: { $regex: query, $options: "i" } }
        ];
    }

    try {
        const allListings = await Listing.find(filters);
        res.render("search.ejs", { allListings });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
