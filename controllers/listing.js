const Listing = require("../models/listing.js");
const Favorite = require("../models/favourite.js");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user.js");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({ verificationStatus: 'verified' });
  res.render("index.ejs", { allListings });
};


module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};

// SHOW
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let userId = req.user ? req.user._id.toString() : null;
  let favoriteListings = [];

  if (userId) {
    const favorite = await Favorite.findOne({ userId });
    favoriteListings = favorite ? favorite.listingId.map(id => id.toString()) : [];
  }

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Show pending listings to their owners and admins
  if (listing.verificationStatus === 'pending') {
    if (req.user?.isAdmin || (userId && listing.owner._id.toString() === userId)) {
      req.flash("info", "This listing is pending admin verification. It will be visible to others once verified.");
      return res.render("show.ejs", { listing, userId, favoriteListings });
    } else {
      req.flash("error", "This listing is currently under review and will be available soon!");
      return res.redirect("/listings");
    }
  }

  // Only show verified listings to regular users
  if (!req.user?.isAdmin && listing.verificationStatus !== 'verified') {
    req.flash("error", "This listing is not available for viewing!");
    return res.redirect("/listings");
  }

  res.render("show.ejs", { listing, userId, favoriteListings });
};

// CREATE
module.exports.createListing = async (req, res, next) => {
  const url = req.file.path;
  const filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.verificationStatus = 'pending'; // Set initial status as pending

  await newListing.save();
  req.flash("success", "New Listing Created! Waiting for admin verification.");
  res.redirect("/listings");
};

// DELETE
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("edit.ejs", { listing, originalImageUrl });
};

// UPDATE
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { 
    ...req.body.listing,
    verificationStatus: 'pending' // Set status to pending after edit
  });

  if (req.file) {
    const url = req.file.path;
    const filename = req.file.filename;
    listing.image = { url, filename };
  }

  await listing.save();
  req.flash("success", "Listing Updated! Waiting for admin verification.");
  res.redirect(`/listings/${id}`);
};

// ADD TO FAVOURITE
module.exports.addToFavourite = async (req, res) => {
  const userId = req.user._id.toString();
  const { id: listingId } = req.params;

  let favorite = await Favorite.findOne({ userId });
  let isFavorite = false;

  if (!favorite) {
    favorite = new Favorite({ userId, listingId: [listingId] });
    isFavorite = true;
  } else {
    const exists = favorite.listingId.some(id => id.toString() === listingId);

    if (exists) {
      favorite.listingId = favorite.listingId.filter(id => id.toString() !== listingId);
      isFavorite = false;
    } else {
      favorite.listingId.push(listingId);
      isFavorite = true;
    }
  }

  await favorite.save();
  req.flash("success", "All your Favorite Listing!");
  res.json({ success: true, isFavorite });
};

// GET FAVOURITES
module.exports.Favourite = async (req, res) => {
  const userId = req.user._id.toString();
  const favoriteListings = await Favorite.findOne({ userId });

  const listingExists = favoriteListings?.listingId || [];
  const allListings = await Listing.find({ _id: { $in: listingExists } });

  res.render("index.ejs", { allListings });
};

// CREATE PAYMENT ORDER
module.exports.payment = async (req, res) => {
  try {
    const { id: listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

    const options = {
      amount: 5000 * 100,
      currency: "INR",
      receipt: `receipt_${listingId}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, orderId: order.id, amount: options.amount });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CONFIRM PAYMENT
module.exports.confirm = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, listingId } = req.body;
    const userId = req.user._id.toString();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    await Listing.findByIdAndUpdate(listingId, {
      tokenPaid: true,
      tokenPaymentId: razorpay_payment_id,
      buyer: userId,
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { PaidListings: listingId },
    });

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PAID LISTINGS
module.exports.paid = async (req, res) => {
  const userId = req.user._id.toString();
  const user = await User.findById(userId);
  const listingExists = user.PaidListings || [];

  const allListings = await Listing.find({ _id: { $in: listingExists } });
  res.render("index.ejs", { allListings });
};

// PAYMENT RECORDS
module.exports.paymentRecords = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const paidListings = await Listing.find({ buyer: userId, tokenPaid: true });

    res.render("payments.ejs", { paidListings });
  } catch (err) {
    console.error("Error fetching payment records:", err);
    req.flash("error", "Could not fetch payment records.");
    res.redirect("/listings");
  }
};

module.exports.buyersList = async (req, res) => {
  const userId = req.user._id.toString();

  const listings = await Listing.find({ owner: userId, buyer: { $ne: null } })
    .populate("buyer");

  res.render("buyers.ejs", { listings });
};

// MY LISTINGS
module.exports.myListings = async (req, res) => {
  const userId = req.user._id;
  const listings = await Listing.find({ owner: userId })
    .sort({ createdAt: -1 }); // Sort by newest first
  
  res.render("my-listings.ejs", { listings });
};

