import User from '../models/user.model.js'
import { comparePassword, hashPassword } from '../utils/bcrypt.util.js'
import jwt from 'jsonwebtoken'

export const signupUser = async (req, res) => {
  const user = req.body
  const { role, firstName, lastName, email, password } = user

  // check if email already exist
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered',
    })
  }

  const hashedPassword = await hashPassword(password)

  try {
    const newUser = new User({
      ...user,
      password: hashedPassword,
      isProfileComplete: false,
    })
    await newUser.save()
    return res.status(201).json({
      success: true,
      message: 'SignUp Successful',
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const signinUser = async (req, res) => {
  const userCredentials = req.body
  const { email, password } = userCredentials

  try {
    const userFound = await User.findOne({ email }).select('+password')
    if (!userFound)
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" })

    const isLoggedIn = await comparePassword(password, userFound.password)
    if (!isLoggedIn)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid email or password' })
    else {
        userFound.password = undefined
        const token = jwt.sign(
          {id: userFound._id},
          process.env.JWT_SECRET
        )
      return res
        .status(201)
        .json({ success: true, message: 'SignIn successful', token })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export const dashboardController = async (req, res) => {
  try {
    const authHeader = await req.headers.authorization

    if (!authHeader)
      return res.status(401).json({ success: false, message: 'No authHeader' })

    const token = authHeader?.split(' ')[1]

    if (!token) {
      return res
        .status(404)
        .json({ success: false, message: 'No token provided' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return res.status(403).json({ success: false, message: error.message })
      }

      return res.status(200).json({ success: true, user: decoded })
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getUser = async (req, res) => {
  const {id} = req.params
  try {
    const user = await User.findOne({_id: id})
    return res.status(200).json({success: true, user: user})
  } catch (error) {
    return res.status(500).json({ success: true, message: error.message })
    
  }
}

export const updateUser = async (req, res) => {
  const {id} = req.params
  const userUpdate = req.body

  try {
    const updatedUser = await User.findByIdAndUpdate(id, userUpdate,{
      new: true,
    }) 
    return res.status(201).json({
      success: true,
      message: 'User profile updated',
    })   
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}