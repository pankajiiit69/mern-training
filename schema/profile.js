const mongoose = require('mongoose');

// Define your schema
const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref:"User" },
  fullname: { type: String, required: true },
  gender: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  mobile: { type: Number, required: true },
  profilePhotoId: {type: String},
  work_profile: { type: String },
  caste: { type: String },
  age: { type: Number, required: true },
  height: { type: Number }, // Change to Number, 'Double' is not a valid Mongoose type
  food_habbit: { type: String },
  matches: [{type: mongoose.Schema.Types.ObjectId, ref:'Match'}]
});

const ProfileModel = mongoose.model('Profile', profileSchema, 'profile');

module.exports = ProfileModel;