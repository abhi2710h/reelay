require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const makeAdmin = async () => {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node makeAdmin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });

  if (!user) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`✓ ${user.username} (${user.email}) is now an admin`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

makeAdmin();
