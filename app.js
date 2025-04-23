if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const ExpressError = require("./utils/ExpressError.js");

// Models
const User = require("./models/user.js");
const Admin = require("./models/admin.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const Favorite = require("./models/favourite.js");

// Routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");
const adminRouter = require("./routes/admin.js");

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "viewl"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
const dbUrl = process.env.ATLASDB_URL;
main().then(() => console.log("Connected to DB")).catch(err => console.log("Oops, error:", err));
async function main() {
    await mongoose.connect(dbUrl);
}

// Session setup
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 3600,
});
store.on("error", err => {
    console.log("Error in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
const passportConfig = require("./config/passport.js");
passportConfig(passport);

// Flash & user context
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Razorpay setup
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Routes
app.use("/listings/search", searchRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter);

// Demo route
app.get("/demouser", async (req, res) => {
    const fakeUser = new User({ email: "student@gmail.com", username: "delta-student" });
    const registeredUser = await User.register(fakeUser, "helloworld");
    res.send(registeredUser);
});

// Catch-all for 404
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
});

// Start server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
