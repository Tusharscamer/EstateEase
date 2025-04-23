const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user.js");
const Admin = require("../models/admin.js");

module.exports = function (passport) {
    // User Strategy
    passport.use("local", new LocalStrategy(User.authenticate()));

    // Admin Strategy
    passport.use("admin", new LocalStrategy(async (username, password, done) => {
        try {
            const admin = await Admin.findOne({ username: username });
            if (!admin) {
                return done(null, false, { message: "Incorrect username." });
            }

            const isMatch = await admin.authenticate(password);
            if (!isMatch) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, admin);
        } catch (err) {
            return done(err);
        }
    }));

    // Custom serializeUser: store user ID and type
    passport.serializeUser((user, done) => {
        done(null, { id: user.id, type: user instanceof Admin ? "admin" : "user" });
    });

    // Custom deserializeUser: find by ID and type
    passport.deserializeUser(async (obj, done) => {
        try {
            if (obj.type === "admin") {
                const admin = await Admin.findById(obj.id);
                return done(null, admin);
            } else {
                const user = await User.findById(obj.id);
                return done(null, user);
            }
        } catch (err) {
            return done(err);
        }
    });
};
