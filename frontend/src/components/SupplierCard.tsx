import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Edit, Mail, MapPin, Phone, Star, Trash2 } from "lucide-react";
import type { Supplier } from "@/pages/Suppliers";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

type Props = {
  supplier: Supplier;
  handleEdit?: (supplier: Supplier) => void;
  handleDelete?: (id: string) => void;
};

const SupplierCard = ({ supplier, handleEdit, handleDelete }: Props) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{supplier.company_name}</CardTitle>
            <p className="text-sm text-gray-600">{supplier.supplier_code}</p>
          </div>
          {handleEdit && handleDelete && (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(supplier)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(supplier._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {supplier.contact_person && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Contact:</span>
              <span className="text-sm font-medium">
                {supplier.contact_person}
              </span>
            </div>
          )}

          {supplier.email && (
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{supplier.email}</span>
            </div>
          )}

          {supplier.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm">{supplier.phone}</span>
            </div>
          )}

          {supplier.city && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                {supplier.city}, {supplier.country}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">{supplier.rating}/5</span>
          </div>

          {supplier.specialties && supplier.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {supplier.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge variant={supplier.is_active ? "default" : "secondary"}>
              {supplier.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierCard;
