require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

const seedData = async () => {
  await connectDB();
  await User.deleteMany();
  await Property.deleteMany();
  console.log('🗑️  Cleared existing data...');

  const users = await User.insertMany([
    {
      firstName: 'Admin', lastName: 'User',
      email: 'admin@realestate.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN', phone: '9999999999',
      city: 'Mumbai', state: 'Maharashtra', isActive: true
    },
    {
      firstName: 'Rajesh', lastName: 'Kumar',
      email: 'owner@realestate.com',
      password: await bcrypt.hash('owner123', 12),
      role: 'OWNER', phone: '9876543210',
      city: 'Mumbai', state: 'Maharashtra', isActive: true
    },
    {
      firstName: 'Priya', lastName: 'Sharma',
      email: 'agent@realestate.com',
      password: await bcrypt.hash('agent123', 12),
      role: 'AGENT', phone: '9876543211',
      city: 'Delhi', state: 'Delhi', isActive: true
    },
    {
      firstName: 'Amit', lastName: 'Singh',
      email: 'buyer@realestate.com',
      password: await bcrypt.hash('buyer123', 12),
      role: 'BUYER', phone: '9876543212',
      city: 'Bangalore', state: 'Karnataka', isActive: true
    },
    {
      firstName: 'Support', lastName: 'Team',
      email: 'support@realestate.com',
      password: await bcrypt.hash('support123', 12),
      role: 'SUPPORT', phone: '9876543213',
      city: 'Hyderabad', state: 'Telangana', isActive: true
    },
    {
      firstName: 'Sunita', lastName: 'Patel',
      email: 'sunita@realestate.com',
      password: await bcrypt.hash('owner123', 12),
      role: 'OWNER', phone: '9876543214',
      city: 'Ahmedabad', state: 'Gujarat', isActive: true
    },
  ]);

  const owner1 = users[1]._id;
  const owner2 = users[5]._id;
  const agentId = users[2]._id;

  await Property.insertMany([
    {
      title: '3BHK Luxury Apartment in Bandra West',
      description: 'Stunning sea-facing apartment with modern amenities in the heart of Bandra. Fully furnished with premium fittings, modular kitchen, and beautiful sea views.',
      propertyType: 'Apartment', listingType: 'Sale', price: 12500000,
      area: 1850, bedrooms: 3, bathrooms: 2, furnishing: 'Furnished',
      parking: true, amenities: ['Gym', 'Pool', 'Security', 'Lift', 'Power Backup'],
      ownerId: owner1, agentId, approvalStatus: 'Approved', featured: true,
      status: 'Available',
      location: { address: '12, Sea View Apartments, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', latitude: 19.0596, longitude: 72.8295 }
    },
    {
      title: '2BHK Modern Flat in Koramangala',
      description: 'Modern 2BHK in prime Koramangala location. Close to tech parks and metro station. Semi-furnished with quality fixtures.',
      propertyType: 'Apartment', listingType: 'Rent', price: 35000,
      area: 1200, bedrooms: 2, bathrooms: 2, furnishing: 'Semi-Furnished',
      parking: true, amenities: ['Lift', 'Power Backup', 'Security', 'Intercom'],
      ownerId: owner2, approvalStatus: 'Approved', featured: true,
      status: 'Available',
      location: { address: '45, Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560095', latitude: 12.9279, longitude: 77.6271 }
    },
    {
      title: 'Spacious Villa in Jubilee Hills',
      description: 'Luxurious independent villa with private garden and swimming pool. Ideal for large families seeking premium lifestyle.',
      propertyType: 'Villa', listingType: 'Sale', price: 35000000,
      area: 4500, bedrooms: 5, bathrooms: 4, furnishing: 'Furnished',
      parking: true, amenities: ['Pool', 'Garden', 'Security', 'Power Backup', 'Club House', 'Gym'],
      ownerId: owner1, agentId, approvalStatus: 'Approved', featured: true,
      status: 'Available',
      location: { address: '8, Road No 10, Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', latitude: 17.4318, longitude: 78.4073 }
    },
    {
      title: 'Commercial Office Space in Connaught Place',
      description: 'Prime commercial space available in the heart of Delhi. Ground floor with high footfall, perfect for retail or office use.',
      propertyType: 'Commercial', listingType: 'Rent', price: 150000,
      area: 2000, bedrooms: 0, bathrooms: 2, furnishing: 'Unfurnished',
      parking: true, amenities: ['Power Backup', 'Lift', 'Security'],
      ownerId: owner2, approvalStatus: 'Approved', featured: false,
      status: 'Available',
      location: { address: 'Block C, Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001', latitude: 28.6328, longitude: 77.2197 }
    },
    {
      title: '1BHK Studio Apartment in HSR Layout',
      description: 'Compact and cozy studio apartment perfect for IT professionals. Fully furnished with all amenities. Zero brokerage.',
      propertyType: 'Studio', listingType: 'Rent', price: 18000,
      area: 650, bedrooms: 1, bathrooms: 1, furnishing: 'Furnished',
      parking: false, amenities: ['Gym', 'Security', 'Power Backup'],
      ownerId: owner1, approvalStatus: 'Approved', featured: false,
      status: 'Available',
      location: { address: '23, HSR Layout Sector 1', city: 'Bangalore', state: 'Karnataka', pincode: '560102', latitude: 12.9082, longitude: 77.6476 }
    },
    {
      title: 'Agricultural Land in Nashik',
      description: '5 acres fertile agricultural land with well and water connection. Ideal for farming or resort development.',
      propertyType: 'Land', listingType: 'Sale', price: 4500000,
      area: 21780, bedrooms: 0, bathrooms: 0, furnishing: 'Unfurnished',
      parking: false, amenities: ['Garden'],
      ownerId: owner2, approvalStatus: 'Approved', featured: false,
      status: 'Available',
      location: { address: 'Village Dindori, Nashik District', city: 'Nashik', state: 'Maharashtra', pincode: '422202', latitude: 20.1086, longitude: 73.7538 }
    },
    {
      title: '4BHK Ultra Luxury Penthouse in Worli',
      description: 'Ultra-luxury penthouse with panoramic sea views, private terrace and world-class amenities. A rare gem in Mumbai.',
      propertyType: 'Apartment', listingType: 'Sale', price: 75000000,
      area: 5200, bedrooms: 4, bathrooms: 4, furnishing: 'Furnished',
      parking: true, amenities: ['Gym', 'Pool', 'Security', 'Lift', 'Club House', 'Children Play Area', 'Power Backup'],
      ownerId: owner1, agentId, approvalStatus: 'Approved', featured: true,
      status: 'Available',
      location: { address: 'Sky Tower, Worli Sea Face', city: 'Mumbai', state: 'Maharashtra', pincode: '400018', latitude: 19.0176, longitude: 72.8167 }
    },
    {
      title: '2BHK Independent House in Bopal',
      description: 'Newly constructed independent house in Bopal with modern design, garden and ample parking. Gated community.',
      propertyType: 'House', listingType: 'Sale', price: 7500000,
      area: 1600, bedrooms: 2, bathrooms: 2, furnishing: 'Semi-Furnished',
      parking: true, amenities: ['Garden', 'Power Backup', 'Security'],
      ownerId: owner2, approvalStatus: 'Approved', featured: false,
      status: 'Available',
      location: { address: '15, Shivalik Complex, Bopal', city: 'Ahmedabad', state: 'Gujarat', pincode: '380058', latitude: 23.0225, longitude: 72.4411 }
    },
    {
      title: '3BHK Apartment in Anna Nagar',
      description: 'Spacious 3BHK in prime Anna Nagar. East facing with great ventilation. Near metro, schools and hospitals.',
      propertyType: 'Apartment', listingType: 'Sale', price: 9800000,
      area: 1750, bedrooms: 3, bathrooms: 2, furnishing: 'Semi-Furnished',
      parking: true, amenities: ['Lift', 'Security', 'Power Backup', 'Gym', 'Children Play Area'],
      ownerId: owner1, approvalStatus: 'Approved', featured: true,
      status: 'Available',
      location: { address: '42, 3rd Avenue, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', latitude: 13.0843, longitude: 80.2102 }
    },
    {
      title: 'Plug & Play Office Space in Cyber City',
      description: 'Modern office space with open floor plan in Gurugram Cyber City. Fully equipped with high-speed internet and meeting rooms.',
      propertyType: 'Commercial', listingType: 'Rent', price: 200000,
      area: 3500, bedrooms: 0, bathrooms: 4, furnishing: 'Furnished',
      parking: true, amenities: ['Gym', 'Power Backup', 'Lift', 'Security', 'Club House'],
      ownerId: owner2, agentId, approvalStatus: 'Pending', featured: false,
      status: 'Available',
      location: { address: 'Tower B, DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122002', latitude: 28.4954, longitude: 77.0877 }
    },
  ]);

  console.log('\n✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👑 ADMIN    → admin@realestate.com    / admin123');
  console.log('🏠 OWNER    → owner@realestate.com    / owner123');
  console.log('🤝 AGENT    → agent@realestate.com    / agent123');
  console.log('🛒 BUYER    → buyer@realestate.com    / buyer123');
  console.log('🎫 SUPPORT  → support@realestate.com  / support123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n🚀 Start server: npm run dev (PORT 5001)`);
  process.exit(0);
};

seedData().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
