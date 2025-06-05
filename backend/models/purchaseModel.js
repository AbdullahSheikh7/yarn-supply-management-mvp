import mongoose from "mongoose";
import Supplier from "./supplierModel.js";
import Product from "./productModel.js";

const purchaseSchema = new mongoose.Schema(
  {
    purchaseOrderNumber: { type: String, required: true, unique: true },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Supplier,
      required: true,
    },
    items: {
      type: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      ],
      required: true,
      validate: {
        validator: (value) => {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one item is required.",
      },
    },
    orderDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "Delivered", "Cancelled"],
      default: "Pending",
    },
    totalAmount: { type: Number },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;
