const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customers');
const { OAuth2Client } = require('google-auth-library');
const { Resend } = require('resend');
const bcrypt = require('bcryptjs');
const {auth, ownerOnly} = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY);

router.get('/', auth, ownerOnly, async (req, res) => {
    try {
        const customers = await Customer.find();

        if (customers.length === 0) return res.status(404).json({ message: "No customers found" });

        return res.status(200).json({ message: "Customers fetched", customers });
    } catch (error) {
        return res.status(500).json({ message: "Server Error" });
    }
});

router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "ID token required" });

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        let customer = await Customer.findOne({ googleId: payload.sub });

        if (!customer) {
            customer = await Customer.create({
                googleId: payload.sub,
                name: payload.name,
                email: payload.email,
                authProvider: 'google',
                address
            });
        }

        const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
        return res.status(200).json({ message: "Login successful", customer, token });
    } catch (error) {
        return res.status(401).json({ message: "Server Error" });
    }
});

router.post('/email-signup', async (req, res) => {
    const { email, name } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    if (!global.otpStore) global.otpStore = {};

    global.otpStore[email] = { otp, name, expiresAt: otpExpiresAt };

    try {
        await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: "Registration OTP code",
            html: `<p>Hello ${name},</p><p>Thankyou for registering to lords restaurant. Here is your OTP <b>${otp}</b>. It will expire in 10 minutes.</p>`
        });

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
            authProvider: 'email',
            address
        });
    }

    delete global.otpStore[email];

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
    return res.json({ message: "OTP verified successfully", customer, token });
});

module.exports = router