import express from "express";
import Purchase from "../models/purchaseModel.js";

const router = express.Router();

// GET all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().populate("supplierId");
    res.json(purchases);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// GET single purchase
router.get("/:id", async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(
      "supplier_id",
      "company_name"
    );
    if (!purchase)
      return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// POST create new purchase
router.post("/", async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// PUT update purchase
router.put("/:id", async (req, res) => {
  try {
    const updated = await Purchase.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Purchase not found" });
    res.json(updated);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

// DELETE purchase
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Purchase.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Purchase not found" });
    res.json({ message: "Purchase deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
});

export default router;
