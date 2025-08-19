import { type Crop, type InsertCrop } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getCrop(id: string): Promise<Crop | undefined>;
  getAllCrops(): Promise<Crop[]>;
  getDefaultCrops(): Promise<Crop[]>;
  getCustomCrops(): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop | undefined>;
  deleteCrop(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private crops: Map<string, Crop>;

  constructor() {
    this.crops = new Map();
    this.initializeDefaultCrops();
  }

  private initializeDefaultCrops() {
    const defaultCrops: Omit<Crop, 'id'>[] = [
      { name: "Tomato", spacePerPlant: 4, yieldPerPlant: 15, isCustom: 0 },
      { name: "Lettuce", spacePerPlant: 1, yieldPerPlant: 2, isCustom: 0 },
      { name: "Carrot", spacePerPlant: 0.5, yieldPerPlant: 0.5, isCustom: 0 },
      { name: "Bell Pepper", spacePerPlant: 3, yieldPerPlant: 8, isCustom: 0 },
      { name: "Cucumber", spacePerPlant: 6, yieldPerPlant: 12, isCustom: 0 },
      { name: "Spinach", spacePerPlant: 0.8, yieldPerPlant: 1.5, isCustom: 0 },
      { name: "Zucchini", spacePerPlant: 9, yieldPerPlant: 20, isCustom: 0 },
      { name: "Mixed Herbs", spacePerPlant: 1, yieldPerPlant: 1, isCustom: 0 },
      { name: "Broccoli", spacePerPlant: 2, yieldPerPlant: 3, isCustom: 0 },
      { name: "Kale", spacePerPlant: 1.5, yieldPerPlant: 2.5, isCustom: 0 },
    ];

    defaultCrops.forEach(crop => {
      const id = randomUUID();
      this.crops.set(id, { ...crop, id });
    });
  }

  async getCrop(id: string): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async getAllCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values());
  }

  async getDefaultCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(crop => crop.isCustom === 0);
  }

  async getCustomCrops(): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(crop => crop.isCustom === 1);
  }

  async createCrop(insertCrop: InsertCrop): Promise<Crop> {
    const id = randomUUID();
    const crop: Crop = { ...insertCrop, id };
    this.crops.set(id, crop);
    return crop;
  }

  async updateCrop(id: string, cropUpdate: Partial<InsertCrop>): Promise<Crop | undefined> {
    const existingCrop = this.crops.get(id);
    if (!existingCrop) {
      return undefined;
    }
    
    const updatedCrop = { ...existingCrop, ...cropUpdate };
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }

  async deleteCrop(id: string): Promise<boolean> {
    const crop = this.crops.get(id);
    if (!crop || crop.isCustom === 0) {
      return false; // Cannot delete default crops
    }
    return this.crops.delete(id);
  }
}

export const storage = new MemStorage();
