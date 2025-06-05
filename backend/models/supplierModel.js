import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    supplier_code: { type: String, required: true, unique: true },
    company_name: { type: String, required: true },
    contact_person: { type: String },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    specialties: [{ type: String }],
    payment_terms: { type: String },
    rating: { type: Number, min: 0, max: 5 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
