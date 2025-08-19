import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CustomCropDialog from "@/components/custom-crop-dialog";
import type { Crop } from "@shared/schema";
import type { GardenPlan } from "@/pages/garden-calculator";
import { apiRequest } from "@/lib/queryClient";

interface InputPanelProps {
  gardenPlan: GardenPlan;
  crops: Crop[];
  onUpdateGardenPlan: (updates: Partial<GardenPlan>) => void;
  onAddCrop: (cropId: string) => void;
  onRemoveCrop: (cropId: string) => void;
  onUpdateCropQuantity: (cropId: string, quantity: number) => void;
  onReset: () => void;
}

export default function InputPanel({
  gardenPlan,
  crops,
  onUpdateGardenPlan,
  onAddCrop,
  onRemoveCrop,
  onUpdateCropQuantity,
  onReset,
}: InputPanelProps) {
  const [selectedCropId, setSelectedCropId] = useState("");
  const [customCropDialogOpen, setCustomCropDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCropMutation = useMutation({
    mutationFn: async (cropId: string) => {
      await apiRequest("DELETE", `/api/crops/${cropId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      toast({ title: "Custom crop deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete crop", variant: "destructive" });
    },
  });

  const convertedSize = gardenPlan.sizeUnit === "sqm" 
    ? (gardenPlan.gardenSize * 10.764).toFixed(1)
    : (gardenPlan.gardenSize / 10.764).toFixed(1);

  const handleAddCrop = () => {
    if (selectedCropId) {
      onAddCrop(selectedCropId);
      setSelectedCropId("");
    }
  };

  const handleEditCrop = (crop: Crop) => {
    setEditingCrop(crop);
    setCustomCropDialogOpen(true);
  };

  const handleDeleteCrop = (crop: Crop) => {
    onRemoveCrop(crop.id);
    deleteCropMutation.mutate(crop.id);
  };

  const selectedCropsWithDetails = gardenPlan.selectedCrops.map(selectedCrop => {
    const cropDetails = crops.find(c => c.id === selectedCrop.cropId);
    return cropDetails ? { ...cropDetails, quantity: selectedCrop.quantity } : null;
  }).filter(Boolean);

  return (
    <Card className="bg-white shadow-garden h-fit" data-testid="card-input-panel">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900" data-testid="text-panel-title">Garden Parameters</CardTitle>
        <p className="text-garden-text" data-testid="text-panel-subtitle">Enter your garden details to get started</p>
      </CardHeader>

      <CardContent className="p-6 lg:p-8 space-y-6">
        {/* Garden Size Input */}
        <div className="space-y-2">
          <Label htmlFor="garden-size" className="text-sm font-medium text-gray-700" data-testid="label-garden-size">Garden Size</Label>
          <div className="flex space-x-3">
            <Input
              id="garden-size"
              type="number"
              placeholder="Enter size"
              value={gardenPlan.gardenSize}
              onChange={(e) => onUpdateGardenPlan({ gardenSize: Number(e.target.value) || 0 })}
              className="flex-1 px-4 py-3 border-garden-gray focus:ring-garden-green focus:border-transparent"
              data-testid="input-garden-size"
            />
            <Select
              value={gardenPlan.sizeUnit}
              onValueChange={(value: "sqft" | "sqm") => onUpdateGardenPlan({ sizeUnit: value })}
            >
              <SelectTrigger className="w-20 border-garden-gray focus:ring-garden-green" data-testid="select-size-unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sqft" data-testid="option-sqft">ft²</SelectItem>
                <SelectItem value="sqm" data-testid="option-sqm">m²</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-garden-text" data-testid="text-converted-size">
            Current size: {gardenPlan.gardenSize} {gardenPlan.sizeUnit} ({convertedSize} {gardenPlan.sizeUnit === "sqft" ? "m²" : "ft²"})
          </p>
        </div>

        {/* Family Members */}
        <div className="space-y-2">
          <Label htmlFor="family-members" className="text-sm font-medium text-gray-700" data-testid="label-family-members">Family Members</Label>
          <Input
            id="family-members"
            type="number"
            placeholder="Number of people"
            value={gardenPlan.familyMembers}
            onChange={(e) => onUpdateGardenPlan({ familyMembers: Number(e.target.value) || 0 })}
            min="1"
            className="px-4 py-3 border-garden-gray focus:ring-garden-green focus:border-transparent"
            data-testid="input-family-members"
          />
          <p className="text-xs text-garden-text" data-testid="text-family-help">This helps determine if your yield will be sufficient</p>
        </div>

        {/* Crop Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700" data-testid="label-selected-crops">Selected Crops</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditingCrop(null);
                setCustomCropDialogOpen(true);
              }}
              className="text-garden-green hover:text-green-600 p-0 h-auto font-medium"
              data-testid="button-add-custom-crop"
            >
              + Add Custom Crop
            </Button>
          </div>
          
          {/* Crop Selection Dropdown */}
          <div className="flex space-x-2">
            <Select value={selectedCropId} onValueChange={setSelectedCropId}>
              <SelectTrigger className="flex-1 border-garden-gray focus:ring-garden-green" data-testid="select-crop">
                <SelectValue placeholder="Select a crop to add..." />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id} data-testid={`option-crop-${crop.id}`}>
                    {crop.name} ({crop.spacePerPlant} ft² per plant)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddCrop}
              disabled={!selectedCropId}
              className="bg-garden-green hover:bg-green-600 text-white"
              data-testid="button-add-crop"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Crops List */}
          <div className="space-y-3">
            {selectedCropsWithDetails.map((crop) => (
              <div
                key={crop.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  crop.isCustom ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
                data-testid={`crop-item-${crop.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900" data-testid={`text-crop-name-${crop.id}`}>{crop.name}</span>
                    {crop.isCustom ? (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded" data-testid={`badge-custom-${crop.id}`}>Custom</span>
                    ) : null}
                    <span className="text-xs text-garden-text bg-white px-2 py-1 rounded" data-testid={`text-space-${crop.id}`}>
                      {crop.spacePerPlant} ft² each
                    </span>
                    <span className="text-xs text-garden-orange bg-orange-50 px-2 py-1 rounded" data-testid={`text-yield-${crop.id}`}>
                      {crop.yieldPerPlant} lbs/plant
                    </span>
                  </div>
                  <div className="mt-2">
                    <Label className="text-xs text-garden-text" data-testid={`label-quantity-${crop.id}`}>Quantity:</Label>
                    <Input
                      type="number"
                      value={crop.quantity}
                      onChange={(e) => onUpdateCropQuantity(crop.id, Number(e.target.value) || 1)}
                      min="1"
                      className="ml-2 w-16 px-2 py-1 text-sm border-garden-gray focus:ring-garden-green inline-block"
                      data-testid={`input-quantity-${crop.id}`}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  {crop.isCustom ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCrop(crop)}
                      className="text-blue-600 hover:text-blue-800 p-1 h-auto"
                      data-testid={`button-edit-crop-${crop.id}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => crop.isCustom ? handleDeleteCrop(crop) : onRemoveCrop(crop.id)}
                    className="text-red-500 hover:text-red-700 p-1 h-auto"
                    data-testid={`button-remove-crop-${crop.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full py-3 border-garden-gray text-garden-text hover:bg-gray-50"
          data-testid="button-reset"
        >
          Reset Calculator
        </Button>
      </CardContent>

      <CustomCropDialog
        open={customCropDialogOpen}
        onOpenChange={setCustomCropDialogOpen}
        editingCrop={editingCrop}
        onSuccess={() => {
          setCustomCropDialogOpen(false);
          setEditingCrop(null);
        }}
      />
    </Card>
  );
}
