const db = require('../database/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
      db.run(query, [email, hashedPassword], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, email });
        }
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, email, created_at FROM users WHERE id = ?';
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User; 