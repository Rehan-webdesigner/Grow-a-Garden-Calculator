import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import type { Crop } from "@shared/schema";
import type { GardenPlan, CalculationResult } from "@/pages/garden-calculator";

interface OutputPanelProps {
  gardenPlan: GardenPlan;
  calculationResult: CalculationResult | null;
  crops: Crop[];
}

export default function OutputPanel({ gardenPlan, calculationResult, crops }: OutputPanelProps) {
  if (!calculationResult) {
    return (
      <Card className="bg-white shadow-garden" data-testid="card-output-panel">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl font-semibold text-gray-900" data-testid="text-analysis-title">Garden Analysis</CardTitle>
          <p className="text-garden-text" data-testid="text-analysis-subtitle">Real-time calculations based on your inputs</p>
        </CardHeader>
        <CardContent className="p-6 lg:p-8">
          <div className="flex items-center justify-center py-12 text-garden-text" data-testid="text-no-calculations">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Add crops to see calculations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSufficiencyIcon = () => {
    switch (calculationResult.sufficiencyStatus) {
      case "sufficient":
        return <CheckCircle className="w-3 h-3 text-garden-success" />;
      case "borderline":
        return <AlertTriangle className="w-3 h-3 text-garden-warning" />;
      case "insufficient":
        return <AlertCircle className="w-3 h-3 text-garden-danger" />;
    }
  };

  const getSufficiencyColor = () => {
    switch (calculationResult.sufficiencyStatus) {
      case "sufficient":
        return "bg-green-50 border-green-200";
      case "borderline":
        return "bg-yellow-50 border-yellow-200";
      case "insufficient":
        return "bg-red-50 border-red-200";
    }
  };

  const getSufficiencyTitle = () => {
    switch (calculationResult.sufficiencyStatus) {
      case "sufficient":
        return "Sufficient for Family";
      case "borderline":
        return "Borderline Sufficient";
      case "insufficient":
        return "Insufficient Yield";
    }
  };

  const getSufficiencyMessage = () => {
    switch (calculationResult.sufficiencyStatus) {
      case "sufficient":
        return `Your garden yield should be sufficient for your family of ${gardenPlan.familyMembers}. You're producing ${calculationResult.yieldPerPerson} lbs per person which meets typical consumption needs.`;
      case "borderline":
        return `Your garden might provide borderline sufficient yield for your family of ${gardenPlan.familyMembers}. Consider adding more space or different crops.`;
      case "insufficient":
        return `Your current garden setup may not provide enough yield for your family of ${gardenPlan.familyMembers}. Consider expanding your garden or selecting higher-yield crops.`;
    }
  };

  const getSufficiencyRecommendation = () => {
    switch (calculationResult.sufficiencyStatus) {
      case "sufficient":
        return "Consider preserving excess produce or sharing with neighbors!";
      case "borderline":
        return "Try adding more efficient crops or expanding your garden space.";
      case "insufficient":
        return "Consider larger garden space or focus on high-yield crops like tomatoes and zucchini.";
    }
  };

  return (
    <Card className="bg-white shadow-garden" data-testid="card-output-panel">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900" data-testid="text-analysis-title">Garden Analysis</CardTitle>
        <p className="text-garden-text" data-testid="text-analysis-subtitle">Real-time calculations based on your inputs</p>
      </CardHeader>

      <CardContent className="p-6 lg:p-8 space-y-6">
        {/* Space Utilization */}
        <div className="p-4 bg-gray-50 rounded-lg" data-testid="section-space-utilization">
          <h3 className="font-semibold text-gray-900 mb-3" data-testid="text-space-title">Space Utilization</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-garden-text">Total Garden:</span>
              <span className="font-medium ml-2" data-testid="text-total-garden">
                {calculationResult.gardenSizeSqFt.toFixed(1)} ft²
              </span>
            </div>
            <div>
              <span className="text-garden-text">Space Used:</span>
              <span className="font-medium ml-2" data-testid="text-space-used">
                {calculationResult.totalSpaceUsed.toFixed(1)} ft²
              </span>
            </div>
            <div>
              <span className="text-garden-text">Available:</span>
              <span className="font-medium ml-2 text-garden-success" data-testid="text-available-space">
                {calculationResult.availableSpace.toFixed(1)} ft²
              </span>
            </div>
            <div>
              <span className="text-garden-text">Efficiency:</span>
              <span className="font-medium ml-2" data-testid="text-efficiency">
                {calculationResult.efficiency}%
              </span>
            </div>
          </div>
          {/* Visual Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-garden-text mb-1">
              <span>Space Usage</span>
              <span data-testid="text-usage-percentage">{calculationResult.efficiency}%</span>
            </div>
            <Progress 
              value={calculationResult.efficiency} 
              className="h-2"
              data-testid="progress-space-usage"
            />
          </div>
        </div>

        {/* Crop-by-Crop Breakdown */}
        <div data-testid="section-crop-analysis">
          <h3 className="font-semibold text-gray-900 mb-3" data-testid="text-crop-analysis-title">Crop Analysis</h3>
          <div className="space-y-3">
            {calculationResult.cropAnalysis.map((crop) => (
              <div
                key={crop.id}
                className={`p-3 border rounded-lg ${crop.isCustom ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
                data-testid={`crop-analysis-${crop.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900" data-testid={`text-crop-analysis-name-${crop.id}`}>{crop.name}</h4>
                    <p className={`text-xs ${crop.isCustom ? 'text-blue-600' : 'text-garden-text'}`} data-testid={`text-crop-analysis-details-${crop.id}`}>
                      {crop.quantity} plants × {crop.spacePerPlant} ft² each
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900" data-testid={`text-crop-space-${crop.id}`}>
                      {crop.spaceUsed.toFixed(1)} ft²
                    </div>
                    <div className="text-xs text-garden-text">space used</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-garden-text">Expected Yield:</span>
                    <span className="font-medium ml-1 text-garden-orange" data-testid={`text-crop-yield-${crop.id}`}>
                      {crop.totalYield.toFixed(1)} lbs
                    </span>
                  </div>
                  <div>
                    <span className="text-garden-text">Per Person:</span>
                    <span className="font-medium ml-1" data-testid={`text-crop-yield-per-person-${crop.id}`}>
                      {crop.yieldPerPerson.toFixed(1)} lbs
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Yield Summary */}
        <div className="p-4 bg-garden-green/5 border border-garden-green/20 rounded-lg" data-testid="section-total-yield">
          <h3 className="font-semibold text-gray-900 mb-3" data-testid="text-total-yield-title">Total Garden Yield</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-garden-green" data-testid="text-total-season-yield">
                {calculationResult.totalYield} lbs
              </div>
              <div className="text-sm text-garden-text">Total Season Yield</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-garden-orange" data-testid="text-yield-per-family-member">
                {calculationResult.yieldPerPerson} lbs
              </div>
              <div className="text-sm text-garden-text">Per Family Member</div>
            </div>
          </div>
        </div>

        {/* Family Sufficiency Status */}
        <div className={`p-4 border rounded-lg ${getSufficiencyColor()}`} data-testid="section-sufficiency">
          <div className="flex items-center space-x-3 mb-2">
            {getSufficiencyIcon()}
            <h3 className={`font-semibold ${
              calculationResult.sufficiencyStatus === "sufficient" ? "text-garden-success" :
              calculationResult.sufficiencyStatus === "borderline" ? "text-garden-warning" :
              "text-garden-danger"
            }`} data-testid="text-sufficiency-title">{getSufficiencyTitle()}</h3>
          </div>
          <p className="text-sm text-garden-text mb-3" data-testid="text-sufficiency-message">
            {getSufficiencyMessage()}
          </p>
          <div className="text-xs text-garden-text" data-testid="text-sufficiency-recommendation">
            <strong>Recommendation:</strong> {getSufficiencyRecommendation()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
