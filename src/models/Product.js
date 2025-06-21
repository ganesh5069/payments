const db = require('../database/database');

class Product {
  static async create(name, quantity, userId) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO products (name, quantity, user_id) VALUES (?, ?, ?)';
      db.run(query, [name, quantity, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, quantity, user_id: userId });
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*, u.email as owner_email 
        FROM products p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM products WHERE user_id = ?';
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async update(id, updates, userId) {
    return new Promise((resolve, reject) => {
      // First check if the product belongs to the user
      const checkQuery = 'SELECT * FROM products WHERE id = ? AND user_id = ?';
      db.get(checkQuery, [id, userId], (err, product) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!product) {
          reject(new Error('Product not found or access denied'));
          return;
        }

        const updateFields = [];
        const values = [];
        
        if (updates.name !== undefined) {
          updateFields.push('name = ?');
          values.push(updates.name);
        }
        
        if (updates.quantity !== undefined) {
          updateFields.push('quantity = ?');
          values.push(updates.quantity);
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
        
        db.run(query, values, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...updates });
          }
        });
      });
    });
  }

  static async decrementQuantity(id, amount = 1) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND quantity >= ?';
      db.run(query, [amount, id, amount], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Insufficient quantity or product not found'));
        } else {
          resolve({ id, decremented: amount });
        }
      });
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM products WHERE id = ? AND user_id = ?';
      db.run(query, [id, userId], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Product not found or access denied'));
        } else {
          resolve({ id });
        }
      });
    });
  }
}

module.exports = Product; 