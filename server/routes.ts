import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCropSchema, gardenCalculationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all crops
  app.get("/api/crops", async (req, res) => {
    try {
      const crops = await storage.getAllCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });

  // Get default crops only
  app.get("/api/crops/default", async (req, res) => {
    try {
      const crops = await storage.getDefaultCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default crops" });
    }
  });

  // Get custom crops only
  app.get("/api/crops/custom", async (req, res) => {
    try {
      const crops = await storage.getCustomCrops();
      res.json(crops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom crops" });
    }
  });

  // Create custom crop
  app.post("/api/crops", async (req, res) => {
    try {
      const cropData = insertCropSchema.parse({ ...req.body, isCustom: 1 });
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create crop" });
      }
    }
  });

  // Update custom crop
  app.patch("/api/crops/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cropData = insertCropSchema.partial().parse(req.body);
      const crop = await storage.updateCrop(id, cropData);
      
      if (!crop) {
        res.status(404).json({ message: "Crop not found or cannot be updated" });
        return;
      }
      
      res.json(crop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update crop" });
      }
    }
  });

  // Delete custom crop
  app.delete("/api/crops/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCrop(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Crop not found or cannot be deleted" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });

  // Calculate garden plan
  app.post("/api/calculate", async (req, res) => {
    try {
      const calculation = gardenCalculationSchema.parse(req.body);
      
      // Convert garden size to sq ft if needed
      let gardenSizeSqFt = calculation.gardenSize;
      if (calculation.sizeUnit === "sqm") {
        gardenSizeSqFt = calculation.gardenSize * 10.764; // m² to ft²
      }

      // Get crop details
      const cropDetails = await Promise.all(
        calculation.selectedCrops.map(async (selectedCrop) => {
          const crop = await storage.getCrop(selectedCrop.cropId);
          return crop ? { ...crop, quantity: selectedCrop.quantity } : null;
        })
      );

      const validCrops = cropDetails.filter(Boolean);

      // Calculate space usage and yields
      let totalSpaceUsed = 0;
      const cropAnalysis = validCrops.map((crop) => {
        const spaceUsed = crop.spacePerPlant * crop.quantity;
        const totalYield = crop.yieldPerPlant * crop.quantity;
        totalSpaceUsed += spaceUsed;

        return {
          ...crop,
          spaceUsed,
          totalYield,
          yieldPerPerson: totalYield / calculation.familyMembers,
        };
      });

      const availableSpace = gardenSizeSqFt - totalSpaceUsed;
      const efficiency = (totalSpaceUsed / gardenSizeSqFt) * 100;
      const totalYield = cropAnalysis.reduce((sum, crop) => sum + crop.totalYield, 0);
      const yieldPerPerson = totalYield / calculation.familyMembers;

      // Determine sufficiency status
      let sufficiencyStatus = "sufficient";
      if (yieldPerPerson < 15) {
        sufficiencyStatus = "insufficient";
      } else if (yieldPerPerson < 25) {
        sufficiencyStatus = "borderline";
      }

      const result = {
        gardenSizeSqFt,
        gardenSizeSqM: gardenSizeSqFt / 10.764,
        totalSpaceUsed,
        availableSpace,
        efficiency: Math.round(efficiency * 10) / 10,
        totalYield: Math.round(totalYield * 10) / 10,
        yieldPerPerson: Math.round(yieldPerPerson * 10) / 10,
        sufficiencyStatus,
        cropAnalysis,
      };

      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid calculation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to calculate garden plan" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
