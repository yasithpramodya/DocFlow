const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}).sort({ createdAt: -1 }).limit(5);
        console.log('--- LATEST USERS & OTPS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | OTP: ${u.otp} | Verified: ${u.isVerified}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
