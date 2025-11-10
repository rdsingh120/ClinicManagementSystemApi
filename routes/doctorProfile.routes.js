import express from 'express'
import auth from '../middlewares/auth.middleware.js'
import {
    getDoctorProfile,
    updateDoctorProfile,
    uploadDoctorPhoto,
    getDoctorPhoto,
    getDoctorPhotoById,
} from '../controllers/doctorProfile.controller.js'

const router = express.Router()

// current logged-in doctor
router.get('/me/profile', auth, getDoctorProfile)
router.put('/me/profile', auth, updateDoctorProfile)

// photo buffer endpoints (self)
router.post('/me/profile/photo', auth, uploadDoctorPhoto)
router.get('/me/profile/photo', auth, getDoctorPhoto)

// fetch a specific doctor's photo by id (for patient browsing)
router.get('/:id/photo', auth, getDoctorPhotoById)

export default router