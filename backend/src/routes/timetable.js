// backend/src/routes/timetable.js
import express from 'express';
const router = express.Router();

// Example timetable route
router.get('/:branch/:year/:section', async (req, res) => {
  const { branch, year, section } = req.params;
  const { day } = req.query;

  // Temporary sample data (replace later with DB)
  const sampleTimetable = [
    { time: '9:00 - 10:00', subject: 'Math', faculty: 'Mr. Sharma' },
    { time: '10:00 - 11:00', subject: 'Physics', faculty: 'Ms. Priya' },
  ];

  res.json(sampleTimetable);
});

export default router;
