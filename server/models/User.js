import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // MTS
    mts_sub: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    lastAuthAt: {
      type: Date,
    },

    fullName: String,
    email: String,
    loan_rating: String,
    rating_update_date: String,
    total_loans: Number,
    is_loan_arrears: Boolean,
    total_debt: Number,
    income: Number,
    profilePhoto: String,

    address_doesnt_match: {
      type: Boolean,
      default: true,
    },

    requisites: {
      account_number: String,
      recipient: String,
      BIC: String,
      bank_name: String,
      corporate_account: String,
      bank_INN: String,
      bank_KPP: String,
      have_an_account: Boolean,
    },

    passport: {
      series_number: String,
      date: String,
      department_code: String,
      issued_by: String,
      birth: String,
      place_of_birth: String,
    },

    address: {
      street: String,
      apartment: String,
      registration_date: String,
    },

    real_address: {
      street: String,
      apartment: String,
    },

    photos: {
      first_page_of_the_passport: String,
      marital_status_page: String,
      previously_issued_passports_page: String,
      page_with_registration_stamp: String,
      children_availability_page: String,
      photo_with_passport: String,
    },

    loans: {
      sum: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
