const express = require('express');
const router = express.Router();
const Table = require('../models/Tables');

router.get('/', async (req, res) => {
    try {
        const tables = await Table.find();

        if (tables.length == 0) {
            return res.status(404).json({ message: 'No tables in database' });
        }

        return res.status(200).json({ message: 'Tables fetched', tables });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { tableNo, seatingCap, isAvailable, reservation } = req.body;

        const existingTables = await Table.findOne({ tableNo });

        if (existingTables) {
            return res.status(400).json({ message: 'Table already exists' });
        }

        const newTable = await Table.create({
            tableNo,
            seatingCap,
            isAvailable,
            reservation
        });

        return res.status(201).json({ message: 'Table created successfully', tableID: newTable._id });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedTable = await Table.findByIdAndDelete(
            id
        );

        if(!deletedTable){
            return res.status(404).json({message: 'Table not found'});
        }

        return res.status(200).json({message: 'Table Deleted', tableID: deletedTable._id});
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports = router;