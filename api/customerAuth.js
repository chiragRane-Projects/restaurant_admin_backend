require('dotenv').config()
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customers');
const nodemailer = require('nodemailer');
const { auth, ownerOnly } = require('../middleware/auth');

router.get('/', auth, ownerOnly, async (req, res) => {
    try {
        const customers = await Customer.find();

        if (customers.length === 0) return res.status(404).json({ message: "No customers found" });

        return res.status(200).json({ message: "Customers fetched", customers });
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
});

router.post('/email-signup', async (req, res) => {
    const { name, email, address } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    if (!global.otpStore) global.otpStore = {};

    global.otpStore[email] = { otp, name,address,  expiresAt: otpExpiresAt };

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Registration OTP code",
            html: `<p>Hello ${name},</p><p>Thank you for registering to Lords Restaurant. Here is your OTP <b>${otp}</b>. It will expire in 10 minutes.</p>`
        });
        console.log(otp);
        return res.json({ message: "OTP sent to email" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const record = global.otpStore?.[email];

    if (!record) return res.status(400).json({ message: "No OTP found" });

    if (record.expiresAt < Date.now()) {
        delete global.otpStore[email];
        return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });


    let customer = await Customer.findOne({ email });
    if (!customer) {
        customer = await Customer.create({
            name: record.name,
            email,
            address: record.address,
        });
    }

    delete global.otpStore[email];

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    return res.json({ message: "OTP verified successfully", customer, token });
});

module.exports = router