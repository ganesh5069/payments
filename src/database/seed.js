const db = require('./database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { email: 'john@example.com', password: hashedPassword },
      { email: 'jane@example.com', password: hashedPassword },
      { email: 'admin@example.com', password: hashedPassword }
    ];

    console.log('Seeding users...');
    for (const user of users) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)', 
          [user.email, user.password], 
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Create sample products
    const products = [
      { name: 'Laptop', quantity: 10, user_id: 1 },
      { name: 'Smartphone', quantity: 15, user_id: 1 },
      { name: 'Headphones', quantity: 20, user_id: 2 },
      { name: 'Tablet', quantity: 8, user_id: 2 },
      { name: 'Keyboard', quantity: 25, user_id: 3 }
    ];

    console.log('Seeding products...');
    for (const product of products) {
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO products (name, quantity, user_id) VALUES (?, ?, ?)', 
          [product.name, product.quantity, product.user_id], 
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('Database seeded successfully!');
    console.log('\nSample users:');
    console.log('- john@example.com / password123');
    console.log('- jane@example.com / password123');
    console.log('- admin@example.com / password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    db.close();
  }
};

// Run seeder
seedDatabase(); 