const router = require("express").Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { registerValidation, loginValidation } = require('../validation');


//REGISTER
router.post("/register", async (req, res) => {
  // VALIDATE DATA BEFORE ADD USER
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)
  // Check if a user already exist
  const emailCheck = await User.findOne({ email: req.body.email })
  if (emailCheck) return res.status(400).send('Email already exist') //if emailCheck===true
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  })
  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
  } catch (error) {
    res.status(400).send(error)
  }
});

//LOGIN 

router.post("/login", async (req, res) => {
  // VALIDATE DATA BEFORE ADD USER
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message);
  // Check user 
  const user = await User.findOne({ email: req.body.email })
  if (!user) return res.status(400).send('Email is not found') //if user===false
  //Password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Password is wrong')
  // Create  and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
  res.header('auth-token', token).send(token);
})


module.exports = router;
