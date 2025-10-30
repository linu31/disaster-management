import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";

// User Registration
export const registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  res.status(201).json({
    message: "Account created successfully",
    user: {
      id: newUser._id,
      email: newUser.email,
      token: generateToken(newUser._id),
    },
  });
};

// User Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid email or password" });

  const token = generateToken(user._id);

  res.status(200).json({
    message: "Login successful",
    token,
    user: { id: user._id, fullName: user.fullName, email: user.email, volunteerData: user.volunteerData }
  });
};
