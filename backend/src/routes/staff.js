import express from 'express';
const router = express.Router();

// Example route — you can customize this later
router.get('/', (req, res) => {
  res.json({ message: 'Staff route working!' });
});

export default router;
