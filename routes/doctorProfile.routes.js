import express from 'express'
import auth from '../middlewares/auth.middleware.js'
import {
    getDoctorProfile,
    updateDoctorProfile
} from '../controllers/doctorProfile.controller.js'

const router = express.Router()

// current logged-in doctor
router.get('/me/profile', auth, getDoctorProfile)
router.put('/me/profile', auth, updateDoctorProfile)

export default router
