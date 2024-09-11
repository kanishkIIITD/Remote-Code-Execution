const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(console.log("MongoDB connected"))
        .catch((err) => {
            console.log("MongoDB connection error:", err);
            process.exit(1);
        });
};
