const User = require("../../models/Comman/UserSchema");
const Chef = require("../../models/Chef/ChefSchema");
const Customer = require("../../models/Customer/CustomerSchema");

const getAllUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const customers = await Customer.find(searchQuery, "-password -phone").lean();
    const chefs = await Chef.find(searchQuery, "-password").lean();
    const allUsers = [...customers, ...chefs];

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const toggleChefAvailability = async (req, res) => {
  try {
    const { chefId } = req.params;
    const chef = await Chef.findById(chefId);

    if (!chef) {
      return res.status(404).json({ message: "Chef not found" });
    }

    chef.isAvailable = !chef.isAvailable;
    await chef.save();

    res.status(200).json({
      message: "Availability updated",
      isAvailable: chef.isAvailable,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const toggleVerification = async (req, res) => {
  try {
    const { chefId } = req.params;
    
    // Try to find user in Chef collection first
    let user = await Chef.findById(chefId);
    let userType = "Chef";
    
    // If not found in Chef collection, try Customer collection
    if (!user) {
      user = await Customer.findById(chefId);
      userType = "Customer";
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Toggle verification status
    user.isVerified = !user.isVerified;
    await user.save();
    
    res.status(200).json({
      message: `${userType} verification status updated`,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const verifyChef = async (req, res) => {
  try {
    const { chefId } = req.params;
    const chef = await Chef.findById(chefId);

    if (!chef) {
      return res.status(404).json({ message: "Chef not found" });
    }

    chef.isVerified = true;
    await chef.save();

    res.status(200).json({
      message: "Chef verified successfully",
      isVerified: chef.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  toggleChefAvailability,
  verifyChef,
  toggleVerification,
};