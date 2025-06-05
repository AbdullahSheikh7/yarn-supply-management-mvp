import { useEffect, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const backend = import.meta.env.VITE_Backend;

export interface Product {
  _id: string;
  product_code: string;
  product_name: string;
  category: string;
  color: string;
  material_type: string;
  weight_per_unit: number;
  unit_of_measurement: string;
  current_stock: number;
  minimum_stock: number;
  unit_price: number;
  description: string;
}

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    product_code: "",
    product_name: "",
    category: "",
    color: "",
    material_type: "",
    weight_per_unit: 0,
    unit_of_measurement: "kg",
    current_stock: 0,
    minimum_stock: 10,
    unit_price: 0,
    description: "",
  });

  const [products, setProducts] = useState<Product[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formDisabled, setFormDisabled] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await axios
        .get(`${backend}/products/`)
        .then((res) => {
          setProducts(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
      setIsLoading(false);
    })();
  }, []);

  const resetForm = () => {
    setFormData({
      product_code: "",
      product_name: "",
      category: "",
      color: "",
      material_type: "",
      weight_per_unit: 0,
      unit_of_measurement: "kg",
      current_stock: 0,
      minimum_stock: 10,
      unit_price: 0,
      description: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormDisabled(true);
    if (editingProduct) {
      await axios
        .put(`${backend}/products/${editingProduct._id}`, formData)
        .then((res) => {
          setIsDialogOpen(false);
          resetForm();
          toast("Product updated successfully");
          if (!products) return;
          const newProducts = products.map((item) => item);
          const productsIndex = products.findIndex(
            (item) => item._id === editingProduct._id
          );
          newProducts.splice(productsIndex, 1, res.data);
          setProducts(newProducts);
        })
        .catch((error) => {
          console.log(error);
          toast(error.response.data.message);
        });
    } else {
      await axios
        .post(`${backend}/products/`, formData)
        .then((res) => {
          setProducts([...products!, res.data]);
          setIsDialogOpen(false);
          resetForm();
          toast("Product created successfully!");
        })
        .catch((error) => {
          console.log(error);
          toast("Error creating product");
        });
    }
    setFormDisabled(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      category: product.category,
      color: product.color || "",
      material_type: product.material_type,
      weight_per_unit: product.weight_per_unit || 0,
      unit_of_measurement: product.unit_of_measurement || "kg",
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      unit_price: product.unit_price || 0,
      description: product.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setIsLoading(true);
      await axios
        .delete(`${backend}/products/${id}`)
        .then(() => {
          setIsLoading(false);
          toast("Product deleted successfully");
          if (!products) return;
          const newProducts = products.map((item) => item);
          const productsIndex = products.findIndex((item) => item._id === id);
          newProducts.splice(productsIndex, 1);
          setProducts(newProducts);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    if (isDialogOpen === false) {
      resetForm();
      setEditingProduct(null);
    }
  }, [isDialogOpen]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {product.product_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {product.product_code}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Material:</span>
                  <span className="text-sm font-medium">
                    {product.material_type}
                  </span>
                </div>
                {product.color && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Color:</span>
                    <span className="text-sm font-medium">{product.color}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {product.current_stock}
                    </span>
                    {product.current_stock <= product.minimum_stock && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unit Price:</span>
                  <span className="text-sm font-medium">
                    ${product.unit_price}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_code">Product Code</Label>
                <Input
                  disabled={formDisabled}
                  id="product_code"
                  value={formData.product_code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, product_code: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  disabled={formDisabled}
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="material_type">Material Type</Label>
                <Input
                  disabled={formDisabled}
                  id="material_type"
                  value={formData.material_type}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, material_type: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  disabled={formDisabled}
                  id="color"
                  value={formData.color}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="weight_per_unit">Weight per Unit</Label>
                <Input
                  disabled={formDisabled}
                  id="weight_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.weight_per_unit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      weight_per_unit: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="unit_of_measurement">Unit</Label>
                <Input
                  disabled={formDisabled}
                  id="unit_of_measurement"
                  value={formData.unit_of_measurement}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      unit_of_measurement: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current_stock">Current Stock</Label>
                <Input
                  disabled={formDisabled}
                  id="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      current_stock: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock">Minimum Stock</Label>
                <Input
                  id="minimum_stock"
                  type="number"
                  value={formData.minimum_stock}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      minimum_stock: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <Input
                  disabled={formDisabled}
                  id="unit_price"
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      unit_price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                disabled={formDisabled}
                id="description"
                value={formData.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? "Update" : "Create"} Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
