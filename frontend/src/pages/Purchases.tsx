import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ban, PackageCheck, Plus, Search } from "lucide-react";
import type { Supplier } from "./Suppliers";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";

interface Purchase {
  _id: string;
  purchaseOrderNumber: string;
  supplierId: Supplier;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  totalAmount: number;
  notes: string;
}

const backend = import.meta.env.VITE_Backend;

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const markDelivered = async (purchaseId: string) => {
    try {
      await axios
        .put(`${backend}/purchases/${purchaseId}`, {
          status: "Delivered",
        })
        .then(async (res) => {
          res.data.items.forEach(
            async (item: Purchase & { quantity: number }) => {
              await axios
                .get(`${backend}/products/${item._id}`)
                .then(async (productRes) => {
                  await axios
                    .put(`${backend}/products/${item._id}`, {
                      current_stock:
                        productRes.data.current_stock + item.quantity,
                    })
                    .then(() => {
                      setPurchases(
                        purchases.map((purchase) =>
                          purchase._id === purchaseId
                            ? { ...purchase, status: "Delivered" }
                            : purchase
                        )
                      );
                      toast.success("Marked as delivered");
                    });
                });
            }
          );
        });
    } catch (error) {
      toast.success("An error occurred while marking purchase as delivered");
      console.error("Error marking purchase as delivered:", error);
    }
  };

  const cancelPurchase = async (purchaseId: string) => {
    try {
      await axios
        .put(`${backend}/purchases/${purchaseId}`, {
          status: "Cancelled",
        })
        .then(() => {
          setPurchases(
            purchases.map((purchase) =>
              purchase._id === purchaseId
                ? { ...purchase, status: "Cancelled" }
                : purchase
            )
          );
          toast.success("Purchase cancelled successfully!");
        });
    } catch (error) {
      console.error("Error cancelling purchase:", error);
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await axios
        .get(`${backend}/purchases/`)
        .then((res) => {
          setPurchases(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
      setIsLoading(false);
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
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
        <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
        <Link to="/purchases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Purchase
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search purchase orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {purchases?.map((purchase) => (
          <Card
            key={purchase._id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold">
                      {purchase.purchaseOrderNumber}
                    </h3>
                    <Badge className={getStatusColor(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Supplier:</span>
                      <p className="font-medium">
                        {purchase.supplierId.company_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <p className="font-medium">
                        {new Date(purchase.orderDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Expected Delivery:</span>
                      <p className="font-medium">
                        {purchase.expectedDeliveryDate
                          ? new Date(
                              purchase.expectedDeliveryDate
                            ).toLocaleDateString()
                          : "TBD"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-medium">${purchase.totalAmount}</p>
                    </div>
                  </div>

                  {purchase.notes && (
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Notes:</span>
                      <p className="text-sm text-gray-700">{purchase.notes}</p>
                    </div>
                  )}
                </div>
                {purchase.status === "Pending" && (
                  <div className="flex flex-col space-y-2 max-md:pt-5">
                    <Button onClick={() => markDelivered(purchase._id)}>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Mark as Delivered
                    </Button>
                    <Button
                      onClick={() => cancelPurchase(purchase._id)}
                      variant={"outline"}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancel Purchase
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Purchases;
