import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Product } from "./Products";
import type { Supplier } from "./Suppliers";
import SupplierCard from "@/components/SupplierCard";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const backend = import.meta.env.VITE_Backend;

interface PurchaseItem extends Product {
  quantity: number;
}

export interface PurchaseFormData {
  purchaseOrderNumber: string;
  supplierId: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  status: string;
  items: PurchaseItem[];
  notes: string;
  totalAmount: number;
}

const PurchaseForm = () => {
  const [supplierError, setSupplierError] = useState<string>("");
  const [productQuantityError, setProductQuantityError] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>();
  const [supplier, setSupplier] = useState<Supplier>();
  const [supplierCompany, setSupplierCompany] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<PurchaseFormData>({
    purchaseOrderNumber: "",
    supplierId: "",
    orderDate: new Date(),
    expectedDeliveryDate: new Date(),
    status: "Pending",
    items: [],
    notes: "",
    totalAmount: 0,
  });

  const navigate = useNavigate();

  const handleQuantityChange = (
    product: Product,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    if (!formData?.items) return;
    const updatedItems = formData.items.map((item) => item);
    const currentItemIndex = updatedItems.findIndex(
      (item) => item._id === product._id
    );
    updatedItems[currentItemIndex].quantity = parseInt(e.target.value);
    setFormData({ ...formData, items: updatedItems });
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await axios
        .get(`${backend}/products/`)
        .then((res) => {
          const purchaseItems = res.data.map((item: PurchaseItem) => {
            item.quantity = 0;
            return item;
          });
          setFormData({ ...formData, items: purchaseItems });
        })
        .catch((error) => {
          console.log(error);
        });
      await axios
        .get(`${backend}/suppliers/`)
        .then((res) => {
          setSuppliers(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
      setIsLoading(false);
    })();
  }, []);

  const calculateTotalAmount = () => {
    return formData.items?.reduce(
      (total, item) => total + item.unit_price * item.quantity,
      0
    );
  };

  const handleSupplierChange = (value: string) => {
    setSupplierCompany(value);
    setSupplierError("");
    const newSupplier = suppliers?.find((supplier) => supplier._id == value);
    if (!newSupplier) return;
    setSupplier(newSupplier);
    setFormData({ ...formData, supplierId: newSupplier._id });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!formData.supplierId) {
        setSupplierError("Supplier is required");
        toast("Supplier is required");
        return;
      }
      const orderedItems: PurchaseItem[] = formData.items.filter(
        (item) => item.quantity > 0
      );
      if (orderedItems.length === 0) {
        setProductQuantityError("Please purchase at least one item");
        toast("Please purchase at least one item");
        return;
      }
      const PONumber = `PO-${Date.now()}`;
      const data: PurchaseFormData = {
        ...formData,
        items: orderedItems,
        purchaseOrderNumber: PONumber,
        totalAmount: calculateTotalAmount(),
      };
      await axios.post(`${backend}/purchases`, data).then(() => {
        navigate("/purchases");
        toast("Purchase order created successfully");
      });
    } catch (error) {
      console.log(error);
      toast("Error creating a purchase order");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Purchase Form</h1>
        </div>
        {[...Array(6)].map((_, i) => {
          return (
            <Card key={i} className="animate-pulse">
              <CardContent className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Form</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Supplier Information */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="supplierId">Supplier</Label>
                <Select
                  onValueChange={handleSupplierChange}
                  value={supplierCompany}
                >
                  <SelectTrigger id="supplierId" className="w-[180px]">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map(({ _id, company_name }) => {
                      return (
                        <SelectItem key={_id} value={_id}>
                          {company_name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {supplier && <SupplierCard supplier={supplier} />}
                {supplierError && (
                  <p className="text-sm text-red-500">{supplierError}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Expected Delivery Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.expectedDeliveryDate &&
                            "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expectedDeliveryDate ? (
                          format(formData.expectedDeliveryDate, "PPP")
                        ) : (
                          <span>Pick delivery date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expectedDeliveryDate}
                        onSelect={(expectedDeliveryDate) => {
                          if (expectedDeliveryDate)
                            setFormData({ ...formData, expectedDeliveryDate });
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchase Items */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData?.items?.map((product, i) => (
              <div key={i}>
                <div className="p-4 border border-gray-400 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-4">
                      <h4 className="text-lg font-medium">
                        {product.product_name}
                      </h4>
                      <div className="flex gap-4">
                        <Badge variant="secondary">{product.category}</Badge>
                        <div className="flex justify-between gap-1">
                          <span className="text-sm text-gray-600">
                            Material:
                          </span>
                          <span className="text-sm font-medium">
                            {product.material_type}
                          </span>
                        </div>
                        <div className="flex justify-between gap-1">
                          <span className="text-sm text-gray-600">
                            Unit price:
                          </span>
                          <span className="text-sm font-medium">
                            ${product.unit_price}
                          </span>
                        </div>
                        {product.color && (
                          <div className="flex justify-between gap-1">
                            <span className="text-sm text-gray-600">
                              Color:
                            </span>
                            <span className="text-sm font-medium">
                              {product.color}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${i}`}>Quantity</Label>
                      <Input
                        id={`quantity-${i}`}
                        type="number"
                        min="0"
                        value={product?.quantity || 0}
                        onChange={(value) =>
                          handleQuantityChange(product, value)
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {productQuantityError && (
              <p className="text-sm text-red-500">{productQuantityError}</p>
            )}

            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-lg font-bold">
                  Total Amount: ${calculateTotalAmount().toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="additional-notes"
              placeholder="Enter any additional notes or special instructions..."
              className="min-h-[100px]"
              value={formData.notes}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="submit">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;
