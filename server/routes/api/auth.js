const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth.js')
const User = require('../../models/User.js')
const { check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')


// @route    POST api/auth
// @desc     Authenticate user & get token / Login user 
// @access   Public

//This bitch logs you in 


router.post("/",[
    check('email',"Please enter a valid email").isEmail(),
    check('password',"Password is required").exists()
],async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        //this will return us a 
        return res.status(400).json({errors:errors.array()})
    }

    const { email, password} = req.body
    try {
        let user = await User.findOne({email})
        if (!user){
            return res.status(400).json({errors:[{msg:'Invalid Credentials'}]})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({errors:[{msg:'Invalid Password'}]})
        }

    const payload = {
        user:{ 
            //this is what we will send along our json token with the user id
            //we can use this mongoose abstraction to prevent from having to do _id like in mongodb
            //ramber that the id is sent along w/ the token?
            id:user.id
        }
    }

    jwt.sign(payload,config.get('jwtSecret'),{expiresIn:36000},(err,token)=>{
        if (err) throw err;//does this block have an implicit "else" in it?
        res.json({ token });
    })
    } catch(err){
        console.error(err.message)
        res.status(500).send('server error in user')
    }
}
)

//// @route    GET api/auth
// @desc     Get user by token
// @access   Private
//So I believe this is where we are basically just testing our retrieval of our user via token


router.get("/",auth, async (req,res) => {
    try {
        const user = await (await User.findById(req.user.id));
        res.json(user)
    } catch (err){
        console.error(err.message)
        res.status(500)
    }
    }
)



module.exports = router