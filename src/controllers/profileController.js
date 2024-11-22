import User from "../models/User.js";

import {
  deleteImage,
  uploadImage as imgurUploadImage,
} from "../services/imgurService.js";

export const updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the old profile picture from Imgur if it exists
    if (user.displayPicture?.imgurDeleteHash) {
      deleteImage(user.displayPicture?.imgurDeleteHash);
    }

    // Upload the new profile picture to Imgur
    const imageBuffer = req.file.buffer;

    const imgurResponse = await imgurUploadImage(imageBuffer);

    user.displayPicture.imgurId = imgurResponse?.id;
    user.displayPicture.url = imgurResponse?.link;
    user.displayPicture.imgurDeleteHash = imgurResponse?.deletehash;

    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      displayPicture: user.displayPicture,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, error });
  }
};

export const clearProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the profile picture from Imgur if it exists
    if (user.displayPicture?.imgurId) {
      const res = await deleteImage(user.displayPicture?.imgurId);

      user.displayPicture = null;
      await user.save();
      res.json({ message: "Profile picture removed successfully", res });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { firstName, lastName } = req.body;

    if (firstName) {
      user.firstName = firstName;
    }

    if (lastName) {
      user.lastName = lastName;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
