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
    // _id пользователя, к которому привязана эта попытка авторизации.
    // Проставляется в handleNotification после успешного сопоставления/создания
    // юзера. Используется в verifySmsCode/finalizeAuth, чтобы подписать JWT
    // строго для нужного аккаунта без повторного поиска.
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // TTL: документ удаляется ровно в момент expires_at (которое = createdAt + expires_in от МТС).
    // Раньше TTL висел на createdAt с фиксированным значением; mongoose не пересоздаёт TTL-индекс
    // при изменении схемы, поэтому в Atlas мог остаться старый индекс на 300с — из-за этого
    // транзакции пропадали и polling получал 404. Старый индекс дропается в server.js при старте.
    expires_at: { type: Date, expires: 0 },
    error: String,
    error_description: String,
    client_notification_token: String,

    can_retry: { type: Boolean, default: false },
    retry_auth_req_id: { type: String, default: null },
    previous_auth_req_id: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuthTransaction", authTransactionSchema);
