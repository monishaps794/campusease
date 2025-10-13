import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // ✅ Make password optional since we use OTP login
    password: { type: String, required: false },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
  },
  { timestamps: true }
);

// ❌ Remove password hashing — not needed for OTP-based login
// If later you add password login for admin, you can re-enable it

const User = mongoose.model("User", userSchema);
export default User;
