const User = require("../../models/Comman/UserSchema");
const Chef = require("../../models/Chef/ChefSchema");
const Dish = require("../../models/Chef/DishSchema");
const jwt = require("jsonwebtoken");

exports.createOrUpdateChefProfile = async (req, res) => {
  try {
    const chefId = req.user._id;
    const {
      phone,
      address,
      specialties,
      schedule,
      experience,
      bio,
      isAvailable,
      deliveryRadius,
      minimumOrder,
      paymentMethods,
      dishes,
      upiId,
      paymentPhoneNumber
    } = req.body;

    let validatedSchedule = schedule;
    if (schedule) {
      if (typeof schedule === "string") {
        validatedSchedule = JSON.parse(schedule);
      }
      validatedSchedule = validatedSchedule.map((day) => ({
        day: day.day,
        isWorking: day.isWorking || !1,
        slots: day.slots?.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxOrders: slot.maxOrders || 0,
        })) || [],
      }));
    }

    let chef = await Chef.findOne({ _id: chefId });
    let profileImageUrl = chef?.profileImage || "/person.jpg";
    let qrCodeImageUrl = chef?.qrCodeImage || "";

    // Handle file uploads
    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileImageUrl = req.files.profileImage[0].path;
      }
      if (req.files.qrCodeImage && req.files.qrCodeImage[0]) {
        qrCodeImageUrl = req.files.qrCodeImage[0].path;
      }
    }

    // Validate payment phone number if provided
    if (paymentPhoneNumber && !/^\d{10}$/.test(paymentPhoneNumber)) {
      return res.status(400).json({
        message: "Payment phone number must be 10 digits"
      });
    }

    if (!chef) {
      chef = new Chef({
        _id: chefId,
        profileImage: profileImageUrl,
        qrCodeImage: qrCodeImageUrl,
        phone,
        address,
        specialties: specialties ? (typeof specialties === "string" ? JSON.parse(specialties) : specialties) : [],
        schedule: validatedSchedule || [],
        experience: experience || 0,
        bio: bio || "",
        isAvailable: isAvailable !== undefined ? isAvailable === "true" || isAvailable === !0 : !0,
        deliveryRadius: deliveryRadius || 0,
        minimumOrder: minimumOrder || 0,
        paymentMethods: paymentMethods ? (typeof paymentMethods === "string" ? JSON.parse(paymentMethods) : paymentMethods) : [],
        averageRating: 0,
        reviewCount: 0,
        upiId: upiId || "",
        paymentPhoneNumber: paymentPhoneNumber || "",
      });
    } else {
      chef.profileImage = profileImageUrl;
      chef.qrCodeImage = qrCodeImageUrl;
      chef.phone = phone || chef.phone;
      chef.address = address || chef.address;
      chef.specialties = specialties ? (typeof specialties === "string" ? JSON.parse(specialties) : specialties) : chef.specialties;
      chef.schedule = validatedSchedule || chef.schedule;
      chef.experience = experience !== undefined ? Number(experience) : chef.experience;
      chef.bio = bio || chef.bio;
      chef.isAvailable = isAvailable !== undefined ? isAvailable === "true" || isAvailable === !0 : chef.isAvailable;
      chef.deliveryRadius = deliveryRadius !== undefined ? Number(deliveryRadius) : chef.deliveryRadius;
      chef.minimumOrder = minimumOrder !== undefined ? Number(minimumOrder) : chef.minimumOrder;
      chef.paymentMethods = paymentMethods ? (typeof paymentMethods === "string" ? JSON.parse(paymentMethods) : paymentMethods) : chef.paymentMethods;
      chef.upiId = upiId || chef.upiId;
      chef.paymentPhoneNumber = paymentPhoneNumber || chef.paymentPhoneNumber;
    }

    if (dishes && (Array.isArray(dishes) || typeof dishes === "string")) {
      const parsedDishes = typeof dishes === "string" ? JSON.parse(dishes) : dishes;
      const dishPromises = parsedDishes.map(async (dish) => {
        if (dish._id) {
          return await Dish.findByIdAndUpdate(
            dish._id,
            {
              name: dish.name,
              description: dish.description,
              price: dish.price,
              ingredients: dish.ingredients,
              category: dish.category,
              subCategory: dish.subCategory,
              chef: chefId,
            },
            { new: !0, runValidators: !0 }
          );
        } else {
          return await Dish.create({
            name: dish.name,
            description: dish.description,
            price: dish.price,
            ingredients: dish.ingredients,
            category: dish.category,
            subCategory: dish.subCategory,
            chef: chefId,
          });
        }
      });
      const savedDishes = await Promise.all(dishPromises);
      chef.dishes = savedDishes.map((dish) => dish._id);
    }

    const savedChef = await chef.save();
    res.status(201).json({
      message: "Chef profile and dishes saved successfully",
      chef: savedChef,
    });
  } catch (error) {
    console.error("Error saving chef profile or dishes:", error);
    res.status(400).json({
      message: "Error saving chef profile or dishes",
      error: error.message,
    });
  }
};

exports.displayOrUpdateChefProfile = async (req, res) => {
  const chefId = req.user._id;

  if (req.method === "GET") {
    try {
      const chef = await Chef.findById(chefId).populate("dishes").lean();
      if (!chef) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      const user = await User.findById(chefId).select("name email location role");
      if (!user) {
        return res.status(404).json({ message: "User data not found" });
      }

      const chefProfile = {
        name: user.name,
        email: user.email,
        location: user.location,
        phone: chef.phone,
        address: chef.address,
        experience: chef.experience,
        profileImage: chef.profileImage,
        qrCodeImage: chef.qrCodeImage, // Include QR code in response
        upiId: chef.upiId, // Include UPI ID in response
        paymentPhoneNumber: chef.paymentPhoneNumber, // Include payment phone number in response
        specialties: chef.specialties,
        dishes: chef.dishes,
        schedule: chef.schedule,
        bio: chef.bio,
        isAvailable: chef.isAvailable,
        deliveryRadius: chef.deliveryRadius,
        minimumOrder: chef.minimumOrder,
        paymentMethods: chef.paymentMethods,
      };

      res.json({ chef: chefProfile });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else if (req.method === "PATCH") {
    try {
      const updates = req.body;

      // Handle file uploads
      if (req.files) {
        if (req.files.profileImage && req.files.profileImage[0]) {
          updates.profileImage = req.files.profileImage[0].path;
        }
        if (req.files.qrCodeImage && req.files.qrCodeImage[0]) {
          updates.qrCodeImage = req.files.qrCodeImage[0].path;
        }
      }

      // Parse JSON strings if needed
      if (updates.specialties && typeof updates.specialties === "string") {
        updates.specialties = JSON.parse(updates.specialties);
      }
      if (updates.experience !== undefined) {
        updates.experience = Number(updates.experience);
      }
      if (updates.minimumOrder !== undefined) {
        updates.minimumOrder = Number(updates.minimumOrder);
      }
      if (updates.deliveryRadius !== undefined) {
        updates.deliveryRadius = Number(updates.deliveryRadius);
      }
      if (updates.paymentMethods && typeof updates.paymentMethods === "string") {
        updates.paymentMethods = JSON.parse(updates.paymentMethods);
      }
      if (updates.schedule && typeof updates.schedule === "string") {
        updates.schedule = JSON.parse(updates.schedule);
      }
      if (updates.dishes && typeof updates.dishes === "string") {
        updates.dishes = JSON.parse(updates.dishes);
      }

      // Validate phone numbers
      if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
        return res.status(400).json({ message: "Phone number must be 10 digits" });
      }
      
      if (updates.paymentPhoneNumber && !/^\d{10}$/.test(updates.paymentPhoneNumber)) {
        return res.status(400).json({ message: "Payment phone number must be 10 digits" });
      }

      if (updates.schedule) {
        updates.schedule = updates.schedule.map((day) => ({
          day: day.day,
          isWorking: day.isWorking || !1,
          slots: day.slots?.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxOrders: slot.maxOrders || 0,
          })) || [],
        }));
      }

      // Update user-level fields
      const userUpdates = {};
      if (updates.name) userUpdates.name = updates.name;
      if (updates.email) userUpdates.email = updates.email;
      if (updates.location) userUpdates.location = updates.location;

      await User.findByIdAndUpdate(chefId, userUpdates, {
        new: !0,
        runValidators: !0,
      });

      let chef = await Chef.findById(chefId);
      if (!chef) {
        return res.status(404).json({ message: "Chef profile not found" });
      }

      // Handle dishes updates
      if (updates.dishes && Array.isArray(updates.dishes)) {
        const dishPromises = updates.dishes.map(async (dish) => {
          if (dish._id) {
            const existingDish = await Dish.findById(dish._id);
            if (!existingDish) {
              return null;
            }

            if (dish.category && dish.subCategory) {
              return await Dish.findByIdAndUpdate(dish._id, dish, {
                new: !0,
                runValidators: !0,
              });
            } else if (dish.category) {
              const subCategories = {
                Veges: ["Paneer", "Aloo", "Gobi", "Bhindi", "Palak", "Mushroom", "Kofta", "Chole"],
                Rotis: ["Tandoori Roti", "Naan", "Rumali Roti", "Paratha", "Bhakri", "Kulcha", "Missi Roti", "Puri"],
                Rice: ["Biryani", "Fried Rice", "Pulao", "Khichdi", "Curd Rice", "Jeera Rice", "Vegetable Rice", "Lemon Rice"],
                FastFoods: ["Pizza", "Burger", "Sandwich", "Fries", "Pasta", "Tacos", "Hot Dog", "Nachos"],
                Desserts: ["Ice Cream", "Cake", "Pastry", "Pudding"],
                Beverages: ["Tea", "Coffee", "Juice", "Smoothie"],
              };
              dish.subCategory = subCategories[dish.category][0];
              return await Dish.findByIdAndUpdate(dish._id, dish, {
                new: !0,
                runValidators: !0,
              });
            } else {
              return await Dish.findByIdAndUpdate(dish._id, dish, {
                new: !0,
                runValidators: !0,
              });
            }
          } else {
            return await Dish.create({
              name: dish.name,
              description: dish.description,
              price: dish.price,
              ingredients: dish.ingredients,
              category: dish.category,
              subCategory: dish.subCategory,
              chef: chefId,
            });
          }
        });

        const savedDishes = await Promise.all(dishPromises);
        const validDishes = savedDishes.filter((dish) => dish !== null);
        chef.dishes = validDishes.map((dish) => dish._id);
        await chef.save();
      }

      // Update chef profile with new fields
      chef = await Chef.findByIdAndUpdate(
        chefId,
        {
          profileImage: updates.profileImage || undefined,
          qrCodeImage: updates.qrCodeImage || undefined, // Add QR code image update
          phone: updates.phone || undefined,
          address: updates.address || undefined,
          specialties: updates.specialties || undefined,
          schedule: updates.schedule || undefined,
          bio: updates.bio || undefined,
          experience: updates.experience || undefined,
          isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : undefined,
          deliveryRadius: updates.deliveryRadius || undefined,
          minimumOrder: updates.minimumOrder || undefined,
          paymentMethods: updates.paymentMethods || undefined,
          upiId: updates.upiId || undefined, // Add UPI ID update
          paymentPhoneNumber: updates.paymentPhoneNumber || undefined, // Add payment phone number update
        },
        {
          new: !0,
          runValidators: !0,
        }
      ).populate("dishes");

      res.json({
        message: "Chef profile updated successfully",
        chef,
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(400).json({
        message: "Error updating chef profile",
        error: error.message,
      });
    }
  }
};