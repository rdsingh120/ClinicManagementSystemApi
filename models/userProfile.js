import mongoose from 'mongoose'


const medicalHistory = new mongoose.Schema(
  {
    condition: {
      type: String,
    },
    diagnosedOn: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    _id: false,
  }
)


export const patientProfileSchema = new mongoose.Schema({
  healthCardNumber: {
    type: String,
  },
  dob: {
    type: Date,
    validate: value => value <= new Date()
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  isOrganDonar: {
    type: Boolean,
  },
  medicalHistory: [medicalHistory],
}, 
{
  _id:false
})

export const doctorProfileSchema = new mongoose.Schema({
  medicalLicenceNumber: {
    type: String,
  },
  phone: {
    type: String,
    trim: true
  },
  specialty: {
    type: String
  }
},{
  _id:false
})

