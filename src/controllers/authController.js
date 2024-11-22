import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import env from "../constants/env.js";

export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: "user",
    });

    const createdUser = await user.save();
    createdUser.password = undefined;

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ user: createdUser, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  console.log("here");

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid login credentials");
    }

    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // remove password from response
    user.password = undefined;

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the old password" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
