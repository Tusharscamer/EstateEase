const mongoose = require("mongoose");
const Admin = require("../models/admin.js");
require("dotenv").config();

async function createAdmin() {
    try {
        const dbUrl = process.env.ATLASDB_URL;
        if (!dbUrl) {
            throw new Error("ATLASDB_URL environment variable is not set");
        }
        
        await mongoose.connect(dbUrl);
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists!");
            return;
        }
        
        const admin = new Admin({
            username: "admin",
            email: "admin@estateease.com"
        });
        
        await Admin.register(admin, "Admin@123");
        console.log("Admin user created successfully!");
        console.log("Username: admin");
        console.log("Password: Admin@123");
        
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await mongoose.disconnect();
    }
}

createAdmin(); 