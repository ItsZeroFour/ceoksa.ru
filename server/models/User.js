import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

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
    inn: String,

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
      name: String,
      middle_name: String,
      surname: String,
      gender: String,
      citizenship: String,
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

    manual_real_address: {
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

    additional_telephone: {
      name: String,
      phone: String,
      owner: String,
    },

    additional_data: {
      education: String,
      marital_status: String,
      children: String,
      has_property: {
        type: Boolean,
        default: false,
      },
      has_car: {
        type: Boolean,
        default: false,
      },
      car_number: String,
    },

    place_of_work: {
      employment_type: String,
      organization_name: String,
      start_date: String,
      work_phone: String,
      position: String,
    },

    consentPdfPath: {
      type: String,
      default: null,
    },

    loans: {
      sum: Number,
    },

    loan_application: {
      sum: {
        type: Number,
        default: 500_000,
      },

      date: {
        type: Number,
        default: 36,
      },

      target: {
        type: String,
        default: "Кредит наличными",
      },

      salary: {
        type: Number,
      },
    },

    // === MTS RIM (ID KYC) ===
    rim: {
      applicantExternalId: String,
      lastRequestGuid: String,
      identificationUrl: String,
      identificationStatus: {
        type: String,
        default: null,
      },

      startedAt: String,
      completedAt: String,
      callbackReceivedAt: String,
      selfiePhotoKey: String,
      passportPhotoKey: String,
      registrationPhotoKey: String,
      inn: String,
      isVerified: Boolean,
      rfmFound: Boolean,
      behaviourScoring: mongoose.Schema.Types.Mixed,
      consents: {
        isAgreedToProcessPdn: Boolean,
        isConfirmedIsNotPdl: Boolean,
      },
      rawResult: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
