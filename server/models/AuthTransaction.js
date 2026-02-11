import mongoose from 'mongoose';

const authTransactionSchema = new mongoose.Schema({
  auth_req_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  correlation_id: String,
  
  phone: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['pending', 'sms_sent', 'success', 'failed', 'expired'],
    default: 'pending'
  },

  smsotp_endpoint: String,
  send_payload: Object,
  access_token: String,
  id_token: String,
  sub: String,
  expires_at: Date,
  error: String,
  error_description: String,
  client_notification_token: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL index - автоудаление через 5 минут
  }
}, {
  timestamps: true
});

export default mongoose.model('AuthTransaction', authTransactionSchema);