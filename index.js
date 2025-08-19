// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  crops;
  constructor() {
    this.crops = /* @__PURE__ */ new Map();
    this.initializeDefaultCrops();
  }
  initializeDefaultCrops() {
    const defaultCrops = [
      { name: "Tomato", spacePerPlant: 4, yieldPerPlant: 15, isCustom: 0 },
      { name: "Lettuce", spacePerPlant: 1, yieldPerPlant: 2, isCustom: 0 },
      { name: "Carrot", spacePerPlant: 0.5, yieldPerPlant: 0.5, isCustom: 0 },
      { name: "Bell Pepper", spacePerPlant: 3, yieldPerPlant: 8, isCustom: 0 },
      { name: "Cucumber", spacePerPlant: 6, yieldPerPlant: 12, isCustom: 0 },
      { name: "Spinach", spacePerPlant: 0.8, yieldPerPlant: 1.5, isCustom: 0 },
      { name: "Zucchini", spacePerPlant: 9, yieldPerPlant: 20, isCustom: 0 },
      { name: "Mixed Herbs", spacePerPlant: 1, yieldPerPlant: 1, isCustom: 0 },
      { name: "Broccoli", spacePerPlant: 2, yieldPerPlant: 3, isCustom: 0 },
      { name: "Kale", spacePerPlant: 1.5, yieldPerPlant: 2.5, isCustom: 0 }
    ];
    defaultCrops.forEach((crop) => {
      const id = randomUUID();
      this.crops.set(id, { ...crop, id });
    });
  }
  async getCrop(id) {
    return this.crops.get(id);
  }
  async getAllCrops() {
    return Array.from(this.crops.values());
  }
  async getDefaultCrops() {
    return Array.from(this.crops.values()).filter((crop) => crop.isCustom === 0);
  }
  async getCustomCrops() {
    return Array.from(this.crops.values()).filter((crop) => crop.isCustom === 1);
  }
  async createCrop(insertCrop) {
    const id = randomUUID();
    const crop = { ...insertCrop, id };
    this.crops.set(id, crop);
    return crop;
  }
  async updateCrop(id, cropUpdate) {
    const existingCrop = this.crops.get(id);
    if (!existingCrop) {
      return void 0;
    }
    const updatedCrop = { ...existingCrop, ...cropUpdate };
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }
  async deleteCrop(id) {
    const crop = this.crops.get(id);
    if (!crop || crop.isCustom === 0) {
      return false;
    }
    return this.crops.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  spacePerPlant: real("space_per_plant").notNull(),
  // in sq ft
  yieldPerPlant: real("yield_per_plant").notNull(),
  // in lbs
  isCustom: integer("is_custom").notNull().default(0)
  // 0 = default, 1 = custom
});
var insertCropSchema = createInsertSchema(crops).omit({
  id: true
});
var gardenCalculationSchema = z.object({
  gardenSize: z.number().min(1),
  sizeUnit: z.enum(["sqft", "sqm"]),
  familyMembers: z.number().min(1),
  selectedCrops: z.array(z.object({
    cropId: z.string(),
    quantity: z.number().min(1)
  }))
});

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/crops", async (req, res) => {
    try {
      const crops2 = await storage.getAllCrops();
      res.json(crops2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });
  app2.get("/api/crops/default", async (req, res) => {
    try {
      const crops2 = await storage.getDefaultCrops();
      res.json(crops2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default crops" });
    }
  });
  app2.get("/api/crops/custom", async (req, res) => {
    try {
      const crops2 = await storage.getCustomCrops();
      res.json(crops2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch custom crops" });
    }
  });
  app2.post("/api/crops", async (req, res) => {
    try {
      const cropData = insertCropSchema.parse({ ...req.body, isCustom: 1 });
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create crop" });
      }
    }
  });
  app2.patch("/api/crops/:id", async (req, res) => {
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
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid crop data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update crop" });
      }
    }
  });
  app2.delete("/api/crops/:id", async (req, res) => {
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
  app2.post("/api/calculate", async (req, res) => {
    try {
      const calculation = gardenCalculationSchema.parse(req.body);
      let gardenSizeSqFt = calculation.gardenSize;
      if (calculation.sizeUnit === "sqm") {
        gardenSizeSqFt = calculation.gardenSize * 10.764;
      }
      const cropDetails = await Promise.all(
        calculation.selectedCrops.map(async (selectedCrop) => {
          const crop = await storage.getCrop(selectedCrop.cropId);
          return crop ? { ...crop, quantity: selectedCrop.quantity } : null;
        })
      );
      const validCrops = cropDetails.filter(Boolean);
      let totalSpaceUsed = 0;
      const cropAnalysis = validCrops.map((crop) => {
        const spaceUsed = crop.spacePerPlant * crop.quantity;
        const totalYield2 = crop.yieldPerPlant * crop.quantity;
        totalSpaceUsed += spaceUsed;
        return {
          ...crop,
          spaceUsed,
          totalYield: totalYield2,
          yieldPerPerson: totalYield2 / calculation.familyMembers
        };
      });
      const availableSpace = gardenSizeSqFt - totalSpaceUsed;
      const efficiency = totalSpaceUsed / gardenSizeSqFt * 100;
      const totalYield = cropAnalysis.reduce((sum, crop) => sum + crop.totalYield, 0);
      const yieldPerPerson = totalYield / calculation.familyMembers;
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
        cropAnalysis
      };
      res.json(result);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Invalid calculation data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to calculate garden plan" });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  // GitHub Pages ke liye base path
  base: "/Grow-a-Garden-Calculator/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    // GitHub Pages ke liye correct output folder
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
