import 'dotenv/config'
import cors from 'cors'
import mongoose from "mongoose";
import express from 'express'
import { signInValidation, signUpValidation } from './middlewares/validate.js'
import connectDB from './config/db.js'
import {
  getUser,
  getUsers,
  signinUser,
  signupUser,
  updateUser,
} from './controllers/user.controller.js'
import auth from './middlewares/auth.middleware.js'
import Appointment from "./models/Appointment.js"; //testing

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

app.get('/api/me', auth, getUser)
app.get('/api/users/:role', getUsers)

app.put('/api/user/:id', updateUser)

//test
app.get("/api/appointments/test-create", async (req, res) => {
  try {
    const appt = await Appointment.create({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: new mongoose.Types.ObjectId(),
      date: new Date("2025-11-10"),
      startTime: new Date("2025-11-10T14:00:00Z"),
      endTime: new Date("2025-11-10T14:30:00Z"),
      notes: "Test from /test-create",
    });
    res.json(appt);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

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
