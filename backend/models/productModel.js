import mongoose from "mongoose";
import Supplier from "./supplierModel.js";

const productSchema = new mongoose.Schema(
  {
    product_code: { type: String, required: true, unique: true },
    product_name: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String },
    material_type: { type: String },
    weight_per_unit: { type: Number },
    unit_of_measurement: { type: String },
    current_stock: { type: Number, default: 0 },
    minimum_stock: { type: Number, default: 0 },
    unit_price: { type: Number },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
