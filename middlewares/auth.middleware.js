import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No auth header' })
    }

    const token = authHeader?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findOne(decoded._id) //.select("-password")
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export default auth
