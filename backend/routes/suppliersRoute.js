import express from "express";
import Supplier from "../models/supplierModel.js";

const router = express.Router();

// GET all suppliers
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// GET single supplier
router.get("/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) res.status(404).json({ message: "Supplier not found" });
    res.json(supplier);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// POST create new supplier
router.post("/", async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// PUT update supplier
router.put("/:id", async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) res.status(404).json({ message: "Supplier not found" });
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// DELETE supplier
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) res.status(404).json({ message: "Supplier not found" });
    res.json({ message: "Supplier deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

export default router;
