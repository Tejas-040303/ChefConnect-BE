const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt'); // Added missing bcrypt import

// Load env variables
dotenv.config();

// Import models
const User = require('./models/Comman/UserSchema');
const Chef = require('./models/Chef/ChefSchema');
const Customer = require('./models/Customer/CustomerSchema');
const Order = require('./models/Chef/OrderSchema');
const Dish = require('./models/Chef/DishSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('Could not connect to MongoDB', err);
  process.exit(1);
});

/**
 * Parse CSV files and convert to objects
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Array of objects from CSV
 */
const parseCSV = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Process chef data from CSV
 * @param {Array} chefData - Array of chef objects from CSV
 */
const processChefData = async (chefData) => {
  try {
    console.log('Processing chef data...');
    for (const chef of chefData) {
      // Check if chef already exists
      const existingChef = await Chef.findOne({ email: chef.email });
      if (existingChef) {
        console.log(`Chef ${chef.name} already exists, updating...`);
        await Chef.findOneAndUpdate(
          { email: chef.email },
          {
            name: chef.name,
            location: chef.location,
            specialties: chef.specialties.split(','),
            isAvailable: chef.isAvailable === 'true',
            experience: parseInt(chef.experience),
            averageRating: parseFloat(chef.averageRating),
            reviewCount: parseInt(chef.reviewCount),
            minimumOrder: parseInt(chef.minimumOrder),
            deliveryRadius: parseInt(chef.deliveryRadius)
          }
        );
      } else {
        // Create a new chef account with basic details
        const newUser = new Chef({
          name: chef.name,
          email: chef.email,
          password: await bcrypt.hash('password123', 10), // Default password
          role: 'Chef',
          location: chef.location,
          specialties: chef.specialties.split(','),
          isAvailable: chef.isAvailable === 'true',
          experience: parseInt(chef.experience),
          averageRating: parseFloat(chef.averageRating),
          reviewCount: parseInt(chef.reviewCount),
          minimumOrder: parseInt(chef.minimumOrder),
          deliveryRadius: parseInt(chef.deliveryRadius),
          isVerified: true,
          status: 'active'
        });
        await newUser.save();
        console.log(`Created chef: ${chef.name}`);
      }
    }
    console.log('Chef data processing complete.');
  } catch (error) {
    console.error('Error processing chef data:', error);
  }
};

/**
 * Process customer data from CSV
 * @param {Array} customerData - Array of customer objects from CSV
 */
const processCustomerData = async (customerData) => {
  try {
    console.log('Processing customer data...');
    for (const customer of customerData) {
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ email: customer.email });
      if (existingCustomer) {
        console.log(`Customer ${customer.name} already exists, updating...`);
        await Customer.findOneAndUpdate(
          { email: customer.email },
          {
            name: customer.name,
            preference: customer.preference,
            allergies: customer.allergies.split(','),
            dietaryRestrictions: customer.dietaryRestrictions,
            loyaltyPoints: parseInt(customer.loyaltyPoints)
          }
        );
      } else {
        // Create a new customer account with basic details
        const newUser = new Customer({
          name: customer.name,
          email: customer.email,
          password: await bcrypt.hash('password123', 10), // Default password
          role: 'Customer',
          preference: customer.preference,
          allergies: customer.allergies.split(','),
          dietaryRestrictions: customer.dietaryRestrictions,
          loyaltyPoints: parseInt(customer.loyaltyPoints),
          isVerified: true,
          status: 'active'
        });
        await newUser.save();
        console.log(`Created customer: ${customer.name}`);
      }
    }
    console.log('Customer data processing complete.');
  } catch (error) {
    console.error('Error processing customer data:', error);
  }
};

/**
 * Process dish data from CSV
 * @param {Array} dishData - Array of dish objects from CSV
 */
const processDishData = async (dishData) => {
  try {
    console.log('Processing dish data...');
    for (const dish of dishData) {
      // Find chef by ID or email
      const chef = await Chef.findOne({ 
        $or: [
          { _id: dish.chef_id },
          { name: { $regex: new RegExp(dish.chef_id, 'i') } } // For name-based matching
        ] 
      });
      
      if (!chef) {
        console.log(`Chef not found for dish ${dish.name}, skipping...`);
        continue;
      }
      
      // Check if dish already exists
      const existingDish = await Dish.findOne({ 
        name: dish.name,
        chef: chef._id
      });
      
      if (existingDish) {
        console.log(`Dish ${dish.name} already exists for chef ${chef.name}, updating...`);
        await Dish.findOneAndUpdate(
          { _id: existingDish._id },
          {
            category: dish.category,
            subCategory: dish.subCategory,
            price: parseFloat(dish.price),
            ingredients: dish.ingredients.split(',')
          }
        );
      } else {
        // Create a new dish
        const newDish = new Dish({
          name: dish.name,
          chef: chef._id,
          category: dish.category,
          subCategory: dish.subCategory,
          price: parseFloat(dish.price),
          ingredients: dish.ingredients.split(','),
          description: `Delicious ${dish.name} prepared by Chef ${chef.name}`
        });
        
        await newDish.save();
        console.log(`Created dish: ${dish.name} for chef ${chef.name}`);
        
        // Add dish to chef's dishes array
        await Chef.findByIdAndUpdate(
          chef._id,
          { $push: { dishes: newDish._id } }
        );
      }
    }
    console.log('Dish data processing complete.');
  } catch (error) {
    console.error('Error processing dish data:', error);
  }
};

/**
 * Process order data from CSV
 * @param {Array} orderData - Array of order objects from CSV
 */
const processOrderData = async (orderData) => {
  try {
    console.log('Processing order data...');
    for (const order of orderData) {
      // Find customer and chef by ID or email
      const customer = await Customer.findOne({
        $or: [
          { _id: order.customer_id },
          { name: { $regex: new RegExp(order.customer_id, 'i') } }
        ]
      });
      
      const chef = await Chef.findOne({
        $or: [
          { _id: order.chef_id },
          { name: { $regex: new RegExp(order.chef_id, 'i') } }
        ]
      });
      
      if (!customer || !chef) {
        console.log(`Customer or chef not found for order ${order.id}, skipping...`);
        continue;
      }
      
      // Find dishes
      const dishIds = order.dish_ids.split(',');
      const quantities = order.quantities.split(',').map(q => parseInt(q));
      const orderDishes = [];
      
      for (let i = 0; i < dishIds.length; i++) {
        const dish = await Dish.findOne({
          $or: [
            { _id: dishIds[i] },
            { name: { $regex: new RegExp(dishIds[i], 'i') } }
          ],
          chef: chef._id
        });
        
        if (dish) {
          orderDishes.push({
            dish: dish._id,
            quantity: quantities[i] || 1
          });
        }
      }
      
      if (orderDishes.length === 0) {
        console.log(`No dishes found for order ${order.id}, skipping...`);
        continue;
      }
      
      // Check if order already exists
      const existingOrder = await Order.findOne({
        customer: customer._id,
        chef: chef._id,
        orderDate: new Date(order.orderDate)
      });
      
      if (existingOrder) {
        console.log(`Order already exists for ${customer.name} with chef ${chef.name} on ${order.orderDate}, updating...`);
        await Order.findOneAndUpdate(
          { _id: existingOrder._id },
          {
            dishes: orderDishes,
            total: parseFloat(order.total),
            status: order.status,
            diet: order.diet
          }
        );
      } else {
        // Create a new order
        const today = new Date();
        const selectedDate = new Date(today);
        selectedDate.setDate(today.getDate() + 7); // One week from now
        
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = daysOfWeek[selectedDate.getDay()];
        
        const newOrder = new Order({
          customer: customer._id,
          chef: chef._id,
          dishes: orderDishes,
          numberOfPeople: 2, // Default value
          diet: order.diet,
          selectedDate: new Date(order.orderDate),
          selectedTimeSlot: {
            day: dayName,
            startTime: '12:00',
            endTime: '13:00'
          },
          total: parseFloat(order.total),
          status: order.status,
          isPaid: true,
          deliveryAddress: customer.address || 'Default Address',
          orderDate: new Date(order.orderDate),
          paymentMethod: 'Card',
          paymentStatus: 'Completed'
        });
        
        await newOrder.save();
        console.log(`Created order for ${customer.name} with chef ${chef.name}`);
        
        // Add order to customer's order history
        await Customer.findByIdAndUpdate(
          customer._id,
          { $push: { orderHistory: newOrder._id } }
        );
      }
    }
    console.log('Order data processing complete.');
  } catch (error) {
    console.error('Error processing order data:', error);
  }
};

/**
 * Main migration function
 */
const migrateData = async () => {
  try {
    // Define paths to CSV files
    const chefFilePath = path.join(__dirname, 'data', 'chef_d.csv');
    const customerFilePath = path.join(__dirname, 'data', 'customer_d.csv');
    const dishFilePath = path.join(__dirname, 'data', 'dishes_d.csv');
    const orderFilePath = path.join(__dirname, 'data', 'orders_d.csv');
    
    // Parse CSV files
    const chefData = await parseCSV(chefFilePath);
    const customerData = await parseCSV(customerFilePath);
    const dishData = await parseCSV(dishFilePath);
    const orderData = await parseCSV(orderFilePath);
    
    // Process data in order
    await processChefData(chefData);
    await processCustomerData(customerData);
    await processDishData(dishData);
    await processOrderData(orderData);
    
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
};

// Execute the migration
migrateData();