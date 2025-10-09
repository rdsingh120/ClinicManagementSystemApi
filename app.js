import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { signInValidation, signUpValidation } from './middlewares/validate.js'
import connectDB from './config/db.js'
import {
  getUser,
  signinUser,
  signupUser,
  updateUser,
} from './controllers/user.controller.js'
import auth from './middlewares/auth.middleware.js'

const app = express()
const port = process.env.PORT || 3000
const mongoURI = process.env.MONGO_URI

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'App running OK',
  })
})

app.post('/api/signup', signUpValidation, signupUser)
app.post('/api/signin', signInValidation, signinUser)

app.get('/api/dashboard', auth, getUser)

app.put('/api/user/:id', updateUser)

const start = async () => {
  try {
    await connectDB(mongoURI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log('Error in start ' + error)
  }
}

start()
