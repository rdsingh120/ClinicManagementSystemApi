import express from 'express'
import auth from '../middlewares/auth.middleware.js'
import {
    getDoctorProfile,
    updateDoctorProfile,
    uploadDoctorPhoto,
    getDoctorPhoto
} from '../controllers/doctorProfile.controller.js'

const router = express.Router()

// current logged-in doctor
router.get('/me/profile', auth, getDoctorProfile)
router.put('/me/profile', auth, updateDoctorProfile)

// photo buffer endpoints
router.post('/me/profile/photo', auth, uploadDoctorPhoto)
router.get('/me/profile/photo', auth, getDoctorPhoto)

export default router
