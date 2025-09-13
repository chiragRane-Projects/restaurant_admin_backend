const express = require('express');
const router = express.Router();
const Customer = require('../models/Customers');

router.get('/', async(req, res) => {
    try {
        const customers = await Customer.find();

        if(customers.length === 0) return res.status(404).json({message:"No customer found"});

        return res.status(200).json({message:"Customers fetched", customers});
    } catch (error) {
        return res.status(500).json({message:"Server Error"});
    }
})





module.exports = router;