import User from "../models/User.js";

// Save/Update volunteer data after exam
export const saveVolunteerData = async (req, res) => {
  const userId = req.user._id;
  const { examPassed, examScore } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Update fields
  user.isVolunteer = examPassed;
  user.examPassed = examPassed;
  user.examScore = examScore;
  if (examPassed && !user.dateRegistered) user.dateRegistered = new Date();

  await user.save();

  res.status(200).json({
    message: "Volunteer data saved successfully",
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isVolunteer: user.isVolunteer,
      examPassed: user.examPassed,
      examScore: user.examScore,
      dateRegistered: user.dateRegistered,
    },
  });
};

// Get all available volunteers
export const getAvailableVolunteers = async (req, res) => {
  const volunteers = await User.find({ isVolunteer: true })
    .select("fullName email examScore dateRegistered location skills");
  res.status(200).json({ volunteers });
};
