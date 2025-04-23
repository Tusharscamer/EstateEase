const Admin = require("../models/admin.js");
const Listing = require("../models/listing.js");
const fs = require('fs');
const path = require('path');

module.exports.renderLoginForm = (req, res) => {
    res.render("loginAdmin.ejs");
};
module.exports.renderDashboard = (req, res) => {
    if(req.isAuthenticated()){
        res.render("dashboard.ejs");
    }else{
        req.flash("error", "You must be logged in as admin!");
        res.redirect("/admin/login");
    }
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back Admin!");
    res.redirect("/listings");
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/admin/login");
    });
};

module.exports.dashboard = async (req, res) => {
    try {
        const pendingCount = await Listing.countDocuments({ verificationStatus: 'pending' });
        const verifiedCount = await Listing.countDocuments({ verificationStatus: 'verified' });
        const rejectedCount = await Listing.countDocuments({ verificationStatus: 'rejected' });

        const dashboardPath = path.join(__dirname, '../views/dashboard.ejs'); // changed from 'viewl'
        console.log("Dashboard exists:", fs.existsSync(dashboardPath));

        res.render("dashboard.ejs", {
            pendingCount,
            verifiedCount,
            rejectedCount,
            title: "Admin Dashboard"
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        req.flash("error", "Error loading dashboard");
        res.redirect("/admin/login");
    }
};

module.exports.pendingListings = async (req, res) => {
    const pendingListings = await Listing.find({ verificationStatus: 'pending' }).populate("owner");
    res.render("pending-listings.ejs", { pendingListings });
};

module.exports.verifyListing = async (req, res) => {
    const { id } = req.params;
    const { verificationNotes } = req.body;

    await Listing.findByIdAndUpdate(id, {
        verificationStatus: 'verified',
        verificationNotes
    });

    req.flash("success", "Listing verified successfully!");
    res.redirect("/admin/pending-listings");
};

module.exports.rejectListing = async (req, res) => {
    const { id } = req.params;
    const { verificationNotes } = req.body;

    await Listing.findByIdAndUpdate(id, {
        verificationStatus: 'rejected',
        verificationNotes
    });

    req.flash("success", "Listing rejected!");
    res.redirect("/admin/pending-listings");
};
