const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsyc.js");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.get("/login-choice", userController.renderlongAs);
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup)); 

router.route("/verify-otp")
  .get(userController.renderOtpForm)        // Step 2: show OTP form
  .post(wrapAsync(userController.verifyOtp)); // Step 3: verify OTP and create user


router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

module.exports = router;
