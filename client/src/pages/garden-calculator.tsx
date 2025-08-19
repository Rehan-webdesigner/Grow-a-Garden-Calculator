import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Mail, Globe } from "lucide-react";
import InputPanel from "@/components/input-panel";
import OutputPanel from "@/components/output-panel";
import GardenLayout from "@/components/garden-layout";
import type { Crop } from "@shared/schema";

interface SelectedCrop {
  cropId: string;
  quantity: number;
}

export interface GardenPlan {
  gardenSize: number;
  sizeUnit: "sqft" | "sqm";
  familyMembers: number;
  selectedCrops: SelectedCrop[];
}

export interface CalculationResult {
  gardenSizeSqFt: number;
  gardenSizeSqM: number;
  totalSpaceUsed: number;
  availableSpace: number;
  efficiency: number;
  totalYield: number;
  yieldPerPerson: number;
  sufficiencyStatus: "sufficient" | "borderline" | "insufficient";
  cropAnalysis: Array<{
    id: string;
    name: string;
    spacePerPlant: number;
    yieldPerPlant: number;
    isCustom: number;
    quantity: number;
    spaceUsed: number;
    totalYield: number;
    yieldPerPerson: number;
  }>;
}

export default function GardenCalculator() {
  const [gardenPlan, setGardenPlan] = useState<GardenPlan>({
    gardenSize: 100,
    sizeUnit: "sqft",
    familyMembers: 4,
    selectedCrops: [],
  });

  const { data: crops = [] } = useQuery<Crop[]>({
    queryKey: ["/api/crops"],
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const updateGardenPlan = (updates: Partial<GardenPlan>) => {
    setGardenPlan(prev => ({ ...prev, ...updates }));
  };

  const addCrop = (cropId: string) => {
    const existingCrop = gardenPlan.selectedCrops.find(c => c.cropId === cropId);
    if (existingCrop) {
      updateGardenPlan({
        selectedCrops: gardenPlan.selectedCrops.map(c =>
          c.cropId === cropId ? { ...c, quantity: c.quantity + 1 } : c
        ),
      });
    } else {
      updateGardenPlan({
        selectedCrops: [...gardenPlan.selectedCrops, { cropId, quantity: 1 }],
      });
    }
  };

  const removeCrop = (cropId: string) => {
    updateGardenPlan({
      selectedCrops: gardenPlan.selectedCrops.filter(c => c.cropId !== cropId),
    });
  };

  const updateCropQuantity = (cropId: string, quantity: number) => {
    updateGardenPlan({
      selectedCrops: gardenPlan.selectedCrops.map(c =>
        c.cropId === cropId ? { ...c, quantity } : c
      ),
    });
  };

  const resetCalculator = () => {
    setGardenPlan({
      gardenSize: 100,
      sizeUnit: "sqft",
      familyMembers: 4,
      selectedCrops: [],
    });
    setCalculationResult(null);
  };

  // Real-time calculation
  useEffect(() => {
    if (gardenPlan.selectedCrops.length === 0 || gardenPlan.gardenSize <= 0 || gardenPlan.familyMembers <= 0) {
      setCalculationResult(null);
      return;
    }

    const calculateResults = async () => {
      try {
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gardenPlan),
        });

        if (response.ok) {
          const result = await response.json();
          setCalculationResult(result);
        }
      } catch (error) {
        console.error("Calculation error:", error);
      }
    };

    calculateResults();
  }, [gardenPlan]);

  return (
    <div className="min-h-screen bg-garden-bg font-poppins">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-garden-gray/20" data-testid="header-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-garden-green rounded-lg flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="text-app-title">Garden Calculator</h1>
                <p className="text-sm text-garden-text" data-testid="text-app-subtitle">Plan your perfect home garden</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#calculator" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-calculator">Calculator</a>
              <a href="#tips" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-tips">Garden Tips</a>
              <a href="#about" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-about">About</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="calculator" className="grid lg:grid-cols-2 gap-8">
          <InputPanel
            gardenPlan={gardenPlan}
            crops={crops}
            onUpdateGardenPlan={updateGardenPlan}
            onAddCrop={addCrop}
            onRemoveCrop={removeCrop}
            onUpdateCropQuantity={updateCropQuantity}
            onReset={resetCalculator}
          />

          <OutputPanel
            gardenPlan={gardenPlan}
            calculationResult={calculationResult}
            crops={crops}
          />
        </div>

        {calculationResult && (
          <GardenLayout 
            calculationResult={calculationResult}
            crops={crops}
          />
        )}
      </main>

      {/* Footer */}
      <footer id="tips" className="bg-white border-t border-garden-gray/20 mt-16" data-testid="footer-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Garden Tips */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-tips-title">Garden Tips</h3>
              <ul className="space-y-3 text-sm text-garden-text">
                <li className="flex items-start space-x-2" data-testid="tip-succession">
                  <svg className="w-4 h-4 text-garden-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Plant in succession for continuous harvest</span>
                </li>
                <li className="flex items-start space-x-2" data-testid="tip-companion">
                  <svg className="w-4 h-4 text-garden-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Consider companion planting benefits</span>
                </li>
                <li className="flex items-start space-x-2" data-testid="tip-seasonal">
                  <svg className="w-4 h-4 text-garden-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Account for seasonal variations</span>
                </li>
                <li className="flex items-start space-x-2" data-testid="tip-pathways">
                  <svg className="w-4 h-4 text-garden-green mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span>Leave pathways for garden access</span>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-resources-title">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-planting-guide">Seasonal Planting Guide</a></li>
                <li><a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-spacing-charts">Crop Spacing Charts</a></li>
                <li><a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-companion-guide">Companion Planting Guide</a></li>
                <li><a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-soil-tips">Soil Preparation Tips</a></li>
                <li><a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-harvest-calendar">Harvesting Calendar</a></li>
              </ul>
            </div>

            {/* About */}
            <div id="about">
              <h3 className="font-semibold text-gray-900 mb-4" data-testid="text-about-title">About Garden Calculator</h3>
              <p className="text-sm text-garden-text mb-4" data-testid="text-about-description">
                Plan your perfect home garden with our interactive calculator. Get personalized recommendations 
                based on your space, family size, and crop preferences.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-website">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-garden-text" data-testid="text-copyright">© 2024 Garden Calculator. Built with care for home gardeners.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0 text-sm">
              <a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-privacy">Privacy</a>
              <a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-terms">Terms</a>
              <a href="#" className="text-garden-text hover:text-garden-green transition-colors" data-testid="link-support">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
