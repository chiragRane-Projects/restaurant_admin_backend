const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {auth, ownerOnly} = require('../middleware/auth');

router.post("/register", auth, ownerOnly, async (req, res) => {
    try {
        const { name, phoneNum, username, password, role } = req.body;

        const userExists = await User.findOne({ username });

        if (userExists){
            return res.status(400).json({ message: 'User exists' });
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS || 10, 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            name,
            phoneNum,
            username,
            password: hashedPassword,
            role
        });

        return res.status(200).json({message: 'User created', userId: newUser._id})
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error", error});
    }
})

router.post("/login", async(req, res) => {
    try {
        const {username, password} = req.body;
        const u = await User.findOne({ username });
        if(!u){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const match = await bcrypt.compare(password, u.password);
        if(!match){
            return res.status(400).json({ message:"Invalid credentials "});
        }

        const token = jwt.sign({ id: u._id, role: u.role, name: u.name}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

        res.json({ token, user: { id: u._id, name: u.name, email: u.email, role: u.role } });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;