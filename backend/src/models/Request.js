const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  type: { type: String, enum: ['booking','leave','assignment'], required: true },
  payload: mongoose.Schema.Types.Mixed,
  requesterEmail: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Request = mongoose.model('Request', RequestSchema);
export default Request
