require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/Comman/UserSchema');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Read chef data from JSON file
const chefsData = JSON.parse(fs.readFileSync('./chef.json', 'utf-8'));

// Don't require db config, establish connection directly with a callback
mongoose.connect(process.env.MONGO_CONN)
  .then(async () => {
    console.log("MONGO connected, beginning data upload");
    try {
      // Hash passwords before saving
      const hashedChefs = await Promise.all(
        chefsData.map(async chef => {
          const hashedPassword = await bcrypt.hash(chef.password, 10);
          return { ...chef, password: hashedPassword };
        })
      );

      // Insert into the collection
      const result = await User.insertMany(hashedChefs);
      console.log(`✅ Inserted ${result.length} chef records successfully!`);
    } catch (error) {
      console.error('❌ Error uploading data:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });