const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const {check, validationResult} = require('express-validator');
const User = require('../../models/User');
const moment = require('moment');
const uuidv4 = require('uuid/v4');



router.post("/",auth,
  async (req,res) => {

    try {
        const user = await (await User.findById(req.user.id));
        ++user.totalDays
        await user.save()
        res.json(user.totalDays)
    } catch (err){

        console.error(err.message)
        res.status(500)
    }
}
)

router.post("/consecutive",auth,
  async (req,res) => {

    try {
        const user = await (await User.findById(req.user.id));
        ++user.consecutiveDays
        await user.save()
        res.json(user.consecutiveDays)
    } catch (err){

        console.error(err.message)
        res.status(500)
    }
}
)

module.exports = router
