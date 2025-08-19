import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Crop } from "@shared/schema";

const customCropSchema = z.object({
  name: z.string().min(1, "Crop name is required"),
  spacePerPlant: z.number().min(0.1, "Space per plant must be at least 0.1 ft²"),
  yieldPerPlant: z.number().min(0.1, "Yield per plant must be at least 0.1 lbs"),
});

type CustomCropForm = z.infer<typeof customCropSchema>;

interface CustomCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCrop: Crop | null;
  onSuccess: () => void;
}

export default function CustomCropDialog({ 
  open, 
  onOpenChange, 
  editingCrop, 
  onSuccess 
}: CustomCropDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CustomCropForm>({
    resolver: zodResolver(customCropSchema),
    defaultValues: {
      name: "",
      spacePerPlant: 1,
      yieldPerPlant: 1,
    },
  });

  useEffect(() => {
    if (editingCrop) {
      form.reset({
        name: editingCrop.name,
        spacePerPlant: editingCrop.spacePerPlant,
        yieldPerPlant: editingCrop.yieldPerPlant,
      });
    } else {
      form.reset({
        name: "",
        spacePerPlant: 1,
        yieldPerPlant: 1,
      });
    }
  }, [editingCrop, form]);

  const createCropMutation = useMutation({
    mutationFn: async (data: CustomCropForm) => {
      await apiRequest("POST", "/api/crops", { ...data, isCustom: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      toast({ title: "Custom crop created successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to create crop", variant: "destructive" });
    },
  });

  const updateCropMutation = useMutation({
    mutationFn: async (data: CustomCropForm) => {
      if (!editingCrop) throw new Error("No crop to update");
      await apiRequest("PATCH", `/api/crops/${editingCrop.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crops"] });
      toast({ title: "Custom crop updated successfully" });
      onSuccess();
    },
    onError: () => {
      toast({ title: "Failed to update crop", variant: "destructive" });
    },
  });

  const onSubmit = (data: CustomCropForm) => {
    if (editingCrop) {
      updateCropMutation.mutate(data);
    } else {
      createCropMutation.mutate(data);
    }
  };

  const isLoading = createCropMutation.isPending || updateCropMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-custom-crop">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">
            {editingCrop ? "Edit Custom Crop" : "Add Custom Crop"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crop-name" data-testid="label-crop-name">Crop Name</Label>
            <Input
              id="crop-name"
              {...form.register("name")}
              placeholder="e.g., Heirloom Tomatoes"
              className="border-garden-gray focus:ring-garden-green"
              data-testid="input-crop-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500" data-testid="error-crop-name">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="space-per-plant" data-testid="label-space-per-plant">Space per Plant (ft²)</Label>
            <Input
              id="space-per-plant"
              type="number"
              step="0.1"
              {...form.register("spacePerPlant", { valueAsNumber: true })}
              placeholder="e.g., 2.5"
              className="border-garden-gray focus:ring-garden-green"
              data-testid="input-space-per-plant"
            />
            {form.formState.errors.spacePerPlant && (
              <p className="text-sm text-red-500" data-testid="error-space-per-plant">
                {form.formState.errors.spacePerPlant.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yield-per-plant" data-testid="label-yield-per-plant">Yield per Plant (lbs)</Label>
            <Input
              id="yield-per-plant"
              type="number"
              step="0.1"
              {...form.register("yieldPerPlant", { valueAsNumber: true })}
              placeholder="e.g., 12.5"
              className="border-garden-gray focus:ring-garden-green"
              data-testid="input-yield-per-plant"
            />
            {form.formState.errors.yieldPerPlant && (
              <p className="text-sm text-red-500" data-testid="error-yield-per-plant">
                {form.formState.errors.yieldPerPlant.message}
              </p>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-garden-green hover:bg-green-600 text-white"
              data-testid="button-save"
            >
              {isLoading ? "Saving..." : editingCrop ? "Update Crop" : "Add Crop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
