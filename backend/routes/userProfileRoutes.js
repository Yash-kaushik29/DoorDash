const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require('bcrypt');
const Seller = require("../models/Seller");

const router = express.Router();

router.put("/updateDetails/:userId", async (req, res) => {
  const { name, email } = req.body;
  const {userId} = req.params;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: name, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    var token = jwt.sign(
      {
        userID: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        phone: updatedUser.phone,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res.cookie("token", token).status(200).json({
      success: true,
      message: "User details updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.post("/saveAddress", async (req, res) => {
  const { userId, address } = req.body;

  try {
    const existingUser = await User.findOne({ _id: userId });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    const isDuplicate = existingUser.addresses.some(
      (addr) =>
        addr.fullName === address.fullName &&
        addr.addressLine === address.addressLine &&
        addr.phone === address.phone &&
        addr.area === address.area
    );

    if (isDuplicate) {
      return res.json({
        success: false,
        message: "Duplicate address. Address already exists!",
      });
    }

    if (address.isDefault) {
      existingUser.addresses.forEach((addr) => (addr.isDefault = false));
      existingUser.addresses.unshift(address);
    } else {
      existingUser.addresses.push(address);
    }

    await existingUser.save();

    res
      .status(200)
      .json({ success: true, message: "Address saved successfully." });
  } catch (error) {
    console.error("Error saving address:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/getAddresses", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      success: false,
    });
  }
});

router.delete("/deleteAddress", async (req, res) => {
  const { userId, addressId } = req.query;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.put("/setAsDefault", async (req, res) => {
  const { userId, addressId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );
    if (addressIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found." });
    }

    user.addresses = user.addresses.map((address, index) => {
      if (index === addressIndex) {
        address.isDefault = true;
      } else {
        address.isDefault = false;
      }
      return address;
    });

    const defaultAddress = user.addresses.splice(addressIndex, 1)[0];
    user.addresses.unshift(defaultAddress);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error setting default address:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/getDefaultAddress/:userId", async (req, res) => {
  const { userId } = req.params;

  const user = await User.findOne({ _id: userId });

  if (user.addresses.length > 0) {
    const defaultAddress = user.addresses.filter(
      (address) => address.isDefault === true
    );
    res.status(200).json({ success: true, defaultAddress });
  } else {
    res.json({ success: false, message: "No default address found!" });
  }
});

router.post("/editAddress", async (req, res) => {
  const { userId, addressId, formData } = req.body;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const addressIndex = user.addresses.findIndex(
      (address) => address._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found." });
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...formData, // Override with new data
    };

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Address updated successfully." });
  } catch (error) {
    console.error("Error updating address:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update address." });
  }
});

router.put("/change-password/:userId", async (req, res) => {
  const { password, newPassword } = req.body;
  const {userId} = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}); 

router.put("/change-seller-password/:sellerId", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const {sellerId} = req.params;

  try {
    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(currentPassword, seller.password);

    if (!match) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    seller.password = hashedPassword;
    await seller.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
}); 

module.exports = router;
