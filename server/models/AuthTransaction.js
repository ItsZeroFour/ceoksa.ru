import mongoose from "mongoose";

const authTransactionSchema = new mongoose.Schema(
  {
    auth_req_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    correlation_id: String,

    phone: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "sms_sent",
        "verifying",
        "success",
        "failed",
        "expired",
      ],
      default: "pending",
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

    can_retry: { type: Boolean, default: false },
    retry_auth_req_id: { type: String, default: null },
    previous_auth_req_id: { type: String, default: null },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuthTransaction", authTransactionSchema);
