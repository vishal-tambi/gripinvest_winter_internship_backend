// Simple Database Seeding Script
require('dotenv').config();
const { sequelize, InvestmentProduct, User } = require('../src/models');

const seedProducts = [
  {
    name: "Government Bond - 5Y",
    investment_type: "bond",
    tenure_months: 60,
    annual_yield: 4.5,
    risk_level: "low",
    min_investment: 1000,
    max_investment: 100000,
    description: "Safe government-backed bonds with steady returns"
  },
  {
    name: "Fixed Deposit Premium",
    investment_type: "fd",
    tenure_months: 24,
    annual_yield: 6.2,
    risk_level: "low",
    min_investment: 5000,
    max_investment: 500000,
    description: "High-yield fixed deposit with guaranteed returns"
  },
  {
    name: "Equity Growth Fund",
    investment_type: "mf",
    tenure_months: 36,
    annual_yield: 12.8,
    risk_level: "high",
    min_investment: 500,
    max_investment: 50000,
    description: "Diversified equity mutual fund for long-term growth"
  },
  {
    name: "S&P 500 ETF",
    investment_type: "etf",
    tenure_months: 12,
    annual_yield: 8.5,
    risk_level: "moderate",
    min_investment: 100,
    max_investment: 25000,
    description: "Track the S&P 500 index with low fees"
  },
  {
    name: "Corporate Bond Fund",
    investment_type: "bond",
    tenure_months: 18,
    annual_yield: 5.8,
    risk_level: "moderate",
    min_investment: 2000,
    max_investment: 75000,
    description: "Investment-grade corporate bonds portfolio"
  }
];

const seedUsers = [
  {
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    password_hash: "admin123",
    risk_appetite: "moderate"
  },
  {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    password_hash: "password123",
    risk_appetite: "moderate"
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database (create tables)
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    // Seed users
    console.log('👥 Seeding users...');
    for (const userData of seedUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });

      if (created) {
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`➡️  User already exists: ${user.email}`);
      }
    }

    // Seed products
    console.log('📦 Seeding investment products...');
    for (const productData of seedProducts) {
      const [product, created] = await InvestmentProduct.findOrCreate({
        where: { name: productData.name },
        defaults: productData
      });

      if (created) {
        console.log(`✅ Created product: ${product.name}`);
      } else {
        console.log(`➡️  Product already exists: ${product.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`Users: ${await User.count()}`);
    console.log(`Products: ${await InvestmentProduct.count()}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };