
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173', // Frontend
    'http://localhost:8080', // Main backend/dev
  ],
  credentials: true,
}));
app.use(express.json());

// Hardcoded admin credentials
const ADMIN_EMAIL = 'priyanshujibansal@gmail.com';
const ADMIN_PASSWORD = 'Matasree';

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    // Generate JWT token
  const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '2h' });
  return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Proxy endpoints for donor and patient data (to be implemented)

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});
