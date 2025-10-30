import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ Volunteer-related fields
    isVolunteer: { type: Boolean, default: true },
    examPassed: { type: Boolean, default: true },
    examScore: { type: Number, default: 0 },
    dateRegistered: { type: Date },
    location: { type: String }, // Add this field
    volunteerStatus: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' }, // Add this field
    qualificationDate: { type: Date }, // Add this field
    skills: [{ type: String }], // Add this field
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
