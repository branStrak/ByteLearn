const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "educator", "admin"],
      default: "student",
    },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },

    educatorApplication: {
      qualifications: { type: String },
      experience: { type: String },
      supportingCredentials: { type: [String] },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
      },
      appliedAt: { type: Date },
    },

    profilePicture: {
      type: String,
      default: "default-profile.jpg",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
    },
    educationLevel: {
      type: String,
    },
    phone: {
      type: String,
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", userSchema);
