import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import SupplierCard from "@/components/SupplierCard";
import { toast } from "sonner";

const backend = import.meta.env.VITE_Backend;

export interface Supplier {
  _id: string;
  supplier_code: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  specialties: string[];
  payment_terms: string;
  rating: number;
  is_active: boolean;
}

const Suppliers = () => {
  const [formDisabled, setFormDisabled] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    supplier_code: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    specialties: "",
    payment_terms: "",
    rating: 5,
    is_active: true,
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await axios
        .get(`${backend}/suppliers/`)
        .then((res) => {
          setSuppliers(res.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log(error);
          setIsLoading(false);
        });
    })();
  }, []);

  const resetForm = () => {
    setFormData({
      supplier_code: "",
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      specialties: "",
      payment_terms: "",
      rating: 5,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormDisabled(true);
    if (editingSupplier) {
      await axios
        .put(`${backend}/suppliers/${editingSupplier._id}`, formData)
        .then((res) => {
          setIsDialogOpen(false);
          resetForm();
          toast("Supplier updated successfully");
          if (!suppliers) return;
          const newSuppliers = suppliers.map((item) => item);
          const productsIndex = suppliers.findIndex(
            (item) => item._id === editingSupplier._id
          );
          newSuppliers.splice(productsIndex, 1, res.data);
          setSuppliers(newSuppliers);
        })
        .catch((error) => {
          console.log(error);
          toast(error.response.data.message);
        });
    } else {
      await axios
        .post(`${backend}/suppliers/`, formData)
        .then((res) => {
          setSuppliers([...suppliers!, res.data]);
          setIsDialogOpen(false);
          resetForm();
          toast("Supplier created successfully!");
        })
        .catch((error) => {
          console.log(error);
          toast("Error creating supplier");
        });
    }
    setFormDisabled(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      supplier_code: supplier.supplier_code,
      company_name: supplier.company_name,
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "",
      specialties: supplier.specialties?.join(", ") || "",
      payment_terms: supplier.payment_terms || "",
      rating: supplier.rating || 5,
      is_active: supplier.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setIsLoading(true);
      await axios
        .delete(`${backend}/suppliers/${id}`)
        .then(() => {
          setIsLoading(false);
          toast("Supplier deleted successfully");
          if (!suppliers) return;
          const newProducts = suppliers.map((item) => item);
          const productsIndex = suppliers.findIndex((item) => item._id === id);
          newProducts.splice(productsIndex, 1);
          setSuppliers(newProducts);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          className="pl-10"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers?.map((supplier) => (
          <SupplierCard
            key={supplier._id}
            supplier={supplier}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
          />
        ))}
      </div>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier_code">Supplier Code</Label>
                <Input
                  disabled={formDisabled}
                  id="supplier_code"
                  value={formData.supplier_code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, supplier_code: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  disabled={formDisabled}
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  disabled={formDisabled}
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  disabled={formDisabled}
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  disabled={formDisabled}
                  id="phone"
                  value={formData.phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  disabled={formDisabled}
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({
                      ...formData,
                      rating: parseInt(e.target.value) || 5,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                disabled={formDisabled}
                id="address"
                value={formData.address}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  disabled={formDisabled}
                  id="city"
                  value={formData.city}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  disabled={formDisabled}
                  id="country"
                  value={formData.country}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialties">
                  Specialties (comma-separated)
                </Label>
                <Input
                  disabled={formDisabled}
                  id="specialties"
                  value={formData.specialties}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, specialties: e.target.value })
                  }
                  placeholder="Cotton Threads, Dyes, Chemicals"
                />
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  disabled={formDisabled}
                  id="payment_terms"
                  value={formData.payment_terms}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, payment_terms: e.target.value })
                  }
                  placeholder="Net 30"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                disabled={formDisabled}
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingSupplier(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formDisabled}>
                {editingSupplier ? "Update" : "Create"} Supplier
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
