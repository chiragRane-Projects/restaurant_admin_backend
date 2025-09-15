const express = require('express');
const router = express.Router();
const Dish = require('../models/Dishes');
const {auth, ownerOnly} = require('../middleware/auth');

router.get("/", async(req, res) => {
    try {
        const dishes = await Dish.find();

        if(dishes.length == 0){
            return res.status(404).json({message: "No dishes"});
        }

        return res.status(200).json({message: "Dishes fetched", dishes});
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error", error});
    }
});

router.post("/", auth, ownerOnly, async(req, res) => {
    try {
        const {name, description, quantity, category, dietory, price, image} = req.body;

        const newDish = await Dish.create({
            name,
            description,
            quantity,
            category,
            dietory,
            price,
            image
        });

        return res.status(201).json({message: 'Dish created successfully', dishId: newDish._id})
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error", error}); 
    }
});

router.put('/:id', auth, ownerOnly, async (req, res) => {
  try {
    const { id } = req.params;   
    const updates = req.body;    

    const updatedDish = await Dish.findByIdAndUpdate(
      id,             
      { $set: updates }, 
      { new: true, runValidators: true } 
    );

    if (!updatedDish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    return res.status(200).json({ message: "Dish updated successfully", updatedDish });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.delete('/:id', auth, ownerOnly, async(req, res) => {
    try {
        const {id} = req.params;

        const deleteDish = await Dish.findByIdAndDelete(
            id
        );

        if(!deleteDish){
            return res.status(404).json({message: 'Dish not found'});
        }
        
        return res.status(200).json({message: 'Dish deleted successfully'});
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
})

module.exports = router;