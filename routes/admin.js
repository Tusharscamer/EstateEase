const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsyc.js");
const { isAdmin } = require("../middleware.js");
const adminController = require("../controllers/admin.js");

// Admin login routes
router.route("/login")
    .get(adminController.renderLoginForm)
    .post(
        passport.authenticate("admin", {
            failureRedirect: "/admin/login",
            failureFlash: true,
        }),
        adminController.login
    );

// Admin dashboard and property verification routes
router.get("/dashboard", isAdmin, wrapAsync(adminController.dashboard));
router.get("/pending-listings", isAdmin, wrapAsync(adminController.pendingListings));
router.post("/verify-listing/:id", isAdmin, wrapAsync(adminController.verifyListing));
router.post("/reject-listing/:id", isAdmin, wrapAsync(adminController.rejectListing));

// Admin logout
router.get("/logout", adminController.logout);

module.exports = router;
