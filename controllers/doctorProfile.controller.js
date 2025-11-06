// controllers/doctorProfile.controller.js
import User from '../models/user.model.js'

// GET /api/doctors/me/profile
export const getDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user?._id || req.user?.id
        const user = await User.findById(doctorId)
            .select('firstName lastName email role doctorProfile')

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        // For non-doctors, return an empty profile instead of 403
        if (user.role !== 'DOCTOR') {
            return res.status(200).json({
                success: true,
                doctor: {},
                basic: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            })
        }

        return res.status(200).json({
            success: true,
            doctor: user.doctorProfile || {},
            basic: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        })
    } catch (_err) {
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

// PUT /api/doctors/me/profile
export const updateDoctorProfile = async (req, res) => {
    try {
        const doctorId = req.user?._id || req.user?.id
        const current = await User.findById(doctorId).select('role')
        if (!current) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        if (current.role !== 'DOCTOR') {
            return res.status(403).json({ success: false, message: 'Only doctors can update a doctor profile' })
        }

        const {
            medicalLicenceNumber,
            specialty,
            phone,
            bio,
            timezone,
            education,
            experience
        } = req.body || {}

        // Build a precise $set so we don’t wipe fields unintentionally
        const set = {}
        if (medicalLicenceNumber !== undefined) set['doctorProfile.medicalLicenceNumber'] = medicalLicenceNumber
        if (specialty !== undefined) set['doctorProfile.specialty'] = specialty
        if (phone !== undefined) set['doctorProfile.phone'] = phone
        if (bio !== undefined) set['doctorProfile.bio'] = bio
        if (timezone !== undefined) set['doctorProfile.timezone'] = timezone
        if (Array.isArray(education)) set['doctorProfile.education'] = education
        if (Array.isArray(experience)) set['doctorProfile.experience'] = experience

        if (Object.keys(set).length === 0) {
            return res.status(400).json({ success: false, message: 'No updatable fields provided' })
        }

        const updated = await User.findByIdAndUpdate(
            doctorId,
            { $set: set },
            { new: true, runValidators: true, context: 'query' } // keep validators + proper context
        ).select('doctorProfile')

        return res.status(200).json({
            success: true,
            message: 'Doctor profile updated',
            doctor: updated.doctorProfile || {}
        })
    } catch (error) {
        // Duplicate unique field (e.g., medicalLicenceNumber)
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Duplicate value for a unique field',
                fields: Object.keys(error.keyPattern || {})
            })
        }

        // Mongoose validation errors -> return concrete messages
        if (error?.name === 'ValidationError') {
            const messages = Object.values(error.errors || {}).map(e => e.message)
            return res.status(400).json({
                success: false,
                message: messages[0] || 'Validation failed',
                errors: messages
            })
        }

        // Casting/format errors
        if (error?.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: `Invalid value for ${error.path}`
            })
        }

        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}
