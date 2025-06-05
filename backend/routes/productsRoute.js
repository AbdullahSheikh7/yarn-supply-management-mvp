import express from "express";
import Product from "../models/productModel.js";

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// POST create new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// PUT update product
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (error) {
    console.log(error);
    if (
      error.codeName === "DuplicateKey" &&
      error.keyPattern.product_code === 1
    )
      res.status(500).send({
        message: `Cannot update product: Duplicate product code ${error.keyValue.product_code}`,
        error: error.errorResponse,
      });
    res.status(500).send({
      message: error.message,
    });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

export default router;
