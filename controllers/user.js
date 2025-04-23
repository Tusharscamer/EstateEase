const User = require("../models/user.js");
const { sendOtpEmail } = require("../utils/otpSetup.js");

const otpMap = new Map(); // Temporary storage, you can use Redis/DB for production

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports.renderlongAs = (req, res) => {
    res.render("./login-choice.ejs");
};

module.exports.renderSignupForm = (req, res) => {
    res.render("./signup.ejs");
};

module.exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    const otp = generateOtp();
    // Save info in session or memory (here using a Map)
    otpMap.set(email, { username, password, otp, createdAt: Date.now() });
    try {
        await sendOtpEmail(email, otp);
        req.session.tempEmail = email; // for verification step
        res.redirect("/verify-otp");
    } catch (err) {
        req.flash("error", "Failed to send OTP");
        res.redirect("/signup");
    }
};

module.exports.renderOtpForm = (req, res) => {
    res.render("verifyOtp.ejs");
};

module.exports.verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const email = req.session.tempEmail;
    const record = otpMap.get(email);
    
    if (!record || Date.now() - record.createdAt > 5 * 60 * 1000) {
        req.flash("error", "OTP expired. Please signup again.");
        return res.redirect("/signup");
    }

    if (otp !== record.otp) {
        req.flash("error", "Invalid OTP");
        return res.redirect("/verify-otp");
    }

    try {
        const newUser = new User({ username: record.username, email });
        const registeredUser = await User.register(newUser, record.password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);
            otpMap.delete(email);
            delete req.session.tempEmail;
            req.flash("success", "Welcome to Horizon Homes");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Horizon Homes!");
    
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.renderLoginForm = (req, res) => {
    res.render("./login.ejs");
};