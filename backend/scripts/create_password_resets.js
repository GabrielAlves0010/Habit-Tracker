const pool = require('../src/config/database');

(async () => {
  try {
    const sql = `
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    await pool.query(sql);
    console.log('password_resets table ensured');
    process.exit(0);
  } catch (err) {
    console.error('Error creating password_resets table', err);
    process.exit(1);
  }
})();
