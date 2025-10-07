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
          process.env.JWT_SECRET,
          {expiresIn : '1h'}
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
