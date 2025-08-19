import type { Crop } from "@shared/schema";
import type { GardenPlan } from "@/pages/garden-calculator";

export interface CropAnalysis {
  id: string;
  name: string;
  spacePerPlant: number;
  yieldPerPlant: number;
  isCustom: number;
  quantity: number;
  spaceUsed: number;
  totalYield: number;
  yieldPerPerson: number;
}

export interface GardenAnalysis {
  gardenSizeSqFt: number;
  gardenSizeSqM: number;
  totalSpaceUsed: number;
  availableSpace: number;
  efficiency: number;
  totalYield: number;
  yieldPerPerson: number;
  sufficiencyStatus: "sufficient" | "borderline" | "insufficient";
  cropAnalysis: CropAnalysis[];
}

export function convertGardenSize(size: number, fromUnit: "sqft" | "sqm", toUnit: "sqft" | "sqm"): number {
  if (fromUnit === toUnit) return size;
  
  if (fromUnit === "sqm" && toUnit === "sqft") {
    return size * 10.764; // m² to ft²
  } else if (fromUnit === "sqft" && toUnit === "sqm") {
    return size / 10.764; // ft² to m²
  }
  
  return size;
}

export function calculateGardenAnalysis(
  gardenPlan: GardenPlan,
  crops: Crop[]
): GardenAnalysis | null {
  if (gardenPlan.selectedCrops.length === 0 || gardenPlan.gardenSize <= 0 || gardenPlan.familyMembers <= 0) {
    return null;
  }

  // Convert garden size to sq ft
  const gardenSizeSqFt = convertGardenSize(gardenPlan.gardenSize, gardenPlan.sizeUnit, "sqft");
  const gardenSizeSqM = convertGardenSize(gardenSizeSqFt, "sqft", "sqm");

  // Calculate crop analysis
  const cropAnalysis: CropAnalysis[] = [];
  let totalSpaceUsed = 0;
  let totalYield = 0;

  for (const selectedCrop of gardenPlan.selectedCrops) {
    const crop = crops.find(c => c.id === selectedCrop.cropId);
    if (!crop) continue;

    const spaceUsed = crop.spacePerPlant * selectedCrop.quantity;
    const cropTotalYield = crop.yieldPerPlant * selectedCrop.quantity;
    const yieldPerPerson = cropTotalYield / gardenPlan.familyMembers;

    totalSpaceUsed += spaceUsed;
    totalYield += cropTotalYield;

    cropAnalysis.push({
      ...crop,
      quantity: selectedCrop.quantity,
      spaceUsed,
      totalYield: cropTotalYield,
      yieldPerPerson,
    });
  }

  const availableSpace = gardenSizeSqFt - totalSpaceUsed;
  const efficiency = (totalSpaceUsed / gardenSizeSqFt) * 100;
  const yieldPerPerson = totalYield / gardenPlan.familyMembers;

  // Determine sufficiency status
  let sufficiencyStatus: "sufficient" | "borderline" | "insufficient" = "sufficient";
  if (yieldPerPerson < 15) {
    sufficiencyStatus = "insufficient";
  } else if (yieldPerPerson < 25) {
    sufficiencyStatus = "borderline";
  }

  return {
    gardenSizeSqFt: Math.round(gardenSizeSqFt * 10) / 10,
    gardenSizeSqM: Math.round(gardenSizeSqM * 10) / 10,
    totalSpaceUsed: Math.round(totalSpaceUsed * 10) / 10,
    availableSpace: Math.round(availableSpace * 10) / 10,
    efficiency: Math.round(efficiency * 10) / 10,
    totalYield: Math.round(totalYield * 10) / 10,
    yieldPerPerson: Math.round(yieldPerPerson * 10) / 10,
    sufficiencyStatus,
    cropAnalysis,
  };
}

export function generateGardenRecommendations(analysis: GardenAnalysis): string[] {
  const recommendations: string[] = [];

  if (analysis.efficiency < 50) {
    recommendations.push("Consider adding more crops to utilize your garden space better.");
  }

  if (analysis.sufficiencyStatus === "insufficient") {
    recommendations.push("Try adding high-yield crops like tomatoes or zucchini.");
    recommendations.push("Consider expanding your garden if possible.");
  }

  if (analysis.sufficiencyStatus === "borderline") {
    recommendations.push("Add a few more plants or consider succession planting.");
  }

  if (analysis.availableSpace > 20) {
    recommendations.push("You have significant space available for additional crops.");
  }

  if (analysis.efficiency > 80) {
    recommendations.push("Great space efficiency! Consider vertical growing for herbs.");
  }

  return recommendations;
}
