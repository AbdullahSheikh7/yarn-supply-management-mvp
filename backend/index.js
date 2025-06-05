import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config.js";
import productsRoute from "./routes/productsRoute.js";
import suppliersRoute from "./routes/suppliersRoute.js";
import purchasesRoute from "./routes/purchasesRoute.js";
import Product from "./models/productModel.js";
import Purchase from "./models/purchaseModel.js";
import Supplier from "./models/supplierModel.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [process.env.FRONTEND || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/", (_, res) => {
  res
    .status(234)
    .send(
      "Welcome to MERN Book store (Developer -> Abdullah)<br><a href='https://linkedin.com/in/abdullahsalahuddin/'>My Linkedin</a><br><a href='https://github.com/AbdullahSheikh7/'>My GitHub</a>"
    );
});

app.get("/dashboard", async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    const suppliersCount = await Supplier.countDocuments();
    const purchasesCount = await Purchase.countDocuments();

    const lowStockProducts = await Product.find({
      $expr: { $gt: ["$minimum_stock", "$current_stock"] },
    }).select("product_name minimum_stock current_stock");

    const categoryData = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);

    const statusData = await Purchase.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const recentPurchases = await Purchase.find()
      .sort({ order_date: -1 })
      .limit(5)
      .populate("supplierId")
      .select("purchaseOrderNumber supplierId totalAmount status")
      .lean();

    const formattedPurchases = recentPurchases.map((p) => ({
      purchaseOrderNumber: p.purchaseOrderNumber,
      supplierId: { company_name: p.supplierId?.company_name || "" },
      totalAmount: p.totalAmount,
      status: p.status,
    }));

    res.json({
      productsCount,
      suppliersCount,
      purchasesCount,
      lowStockProducts,
      categoryData,
      statusData,
      recentPurchases: formattedPurchases,
    });
  } catch (err) {
    res.status(500).json({ message: "Dashboard data fetch error", error: err });
  }
});

app.use("/products", productsRoute);
app.use("/suppliers", suppliersRoute);
app.use("/purchases", purchasesRoute);

mongoose
  .connect(process.env.MongoDBLocal || "")
  .then(() => {
    console.log("App connected to the database");

    app.listen(process.env.PORT, () => {
      console.log(`App is listening to PORT: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
