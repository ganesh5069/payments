const db = require('./database');

const createTables = () => {
  return new Promise((resolve, reject) => {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create products table
    const createProductsTable = `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Create payments table (for future extension)
    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    db.serialize(() => {
      db.run(createUsersTable, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
          reject(err);
          return;
        }
        console.log('Users table created successfully');
      });

      db.run(createProductsTable, (err) => {
        if (err) {
          console.error('Error creating products table:', err.message);
          reject(err);
          return;
        }
        console.log('Products table created successfully');
      });

      db.run(createPaymentsTable, (err) => {
        if (err) {
          console.error('Error creating payments table:', err.message);
          reject(err);
          return;
        }
        console.log('Payments table created successfully');
        resolve();
      });
    });
  });
};

// Run migrations
createTables()
  .then(() => {
    console.log('Database migration completed successfully');
    // process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    // process.exit(1);
  }); 