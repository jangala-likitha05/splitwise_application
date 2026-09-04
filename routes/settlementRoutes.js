const express = require("express")
const router = express.Router()
const Settlement = require("../models/Settlement")

router.post("/:id/settle", async(req,res) =>{
    try{
        const id = req.params.id
        const {paidBy,paidTo,amount} = req.body

        if(paidBy == null || paidTo == null || amount == null){
            return res.status(400).json({message:"It should not be null"})
        }

        const newSettlement = new Settlement({
            group: id,
            paidBy,
            paidTo,
            amount
        })

        await newSettlement.save();

        res.status(201).json(newSettlement);
    }catch(error){
        res.status(500).json({message:"Server Error",error: error.message});
    }
})

module.exports = router;