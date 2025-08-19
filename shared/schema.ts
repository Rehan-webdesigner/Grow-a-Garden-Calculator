import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  spacePerPlant: real("space_per_plant").notNull(), // in sq ft
  yieldPerPlant: real("yield_per_plant").notNull(), // in lbs
  isCustom: integer("is_custom").notNull().default(0), // 0 = default, 1 = custom
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
});

export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;

// Garden calculation types
export const gardenCalculationSchema = z.object({
  gardenSize: z.number().min(1),
  sizeUnit: z.enum(["sqft", "sqm"]),
  familyMembers: z.number().min(1),
  selectedCrops: z.array(z.object({
    cropId: z.string(),
    quantity: z.number().min(1),
  })),
});

export type GardenCalculation = z.infer<typeof gardenCalculationSchema>;
