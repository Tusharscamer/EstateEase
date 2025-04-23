const express = require("express");
const wrapAsync = require("../utils/wrapAsyc.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const router = express.Router();
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// My Listings route - moved to top
router.get("/my-listings", isLoggedIn, wrapAsync(listingController.myListings));

router.get("/buyers", isLoggedIn, wrapAsync(listingController.buyersList));
router.get("/paid", isLoggedIn, wrapAsync(listingController.paymentRecords));
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.post("/pay/verify", isLoggedIn, wrapAsync(listingController.confirm));
router.route("/payment/:id").post(isLoggedIn, wrapAsync(listingController.payment));
router.route("/favourite/:id")
  .post(isLoggedIn, wrapAsync(listingController.addToFavourite))
  .get(isLoggedIn, wrapAsync(listingController.Favourite));

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;
