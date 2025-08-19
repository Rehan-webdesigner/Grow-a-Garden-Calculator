import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Crop } from "@shared/schema";
import type { CalculationResult } from "@/pages/garden-calculator";

interface GardenLayoutProps {
  calculationResult: CalculationResult;
  crops: Crop[];
}

const CROP_COLORS = [
  "bg-red-400 border-red-500",
  "bg-green-400 border-green-500", 
  "bg-blue-400 border-blue-500",
  "bg-yellow-400 border-yellow-500",
  "bg-purple-400 border-purple-500",
  "bg-pink-400 border-pink-500",
  "bg-indigo-400 border-indigo-500",
  "bg-orange-400 border-orange-500",
  "bg-teal-400 border-teal-500",
  "bg-cyan-400 border-cyan-500",
];

export default function GardenLayout({ calculationResult, crops }: GardenLayoutProps) {
  const totalSquares = 100; // 10x10 grid
  const squaresPerUnit = totalSquares / calculationResult.gardenSizeSqFt;
  
  let currentSquare = 0;
  const gridSquares: { color: string; title: string; cropId: string }[] = [];
  
  // Add crop squares
  calculationResult.cropAnalysis.forEach((crop, index) => {
    const squaresNeeded = Math.round(crop.spaceUsed * squaresPerUnit);
    const colorClass = CROP_COLORS[index % CROP_COLORS.length];
    
    for (let i = 0; i < squaresNeeded && currentSquare < totalSquares; i++) {
      gridSquares.push({
        color: colorClass,
        title: crop.name,
        cropId: crop.id,
      });
      currentSquare++;
    }
  });
  
  // Fill remaining squares with available space
  while (currentSquare < totalSquares) {
    gridSquares.push({
      color: "bg-gray-200 border-gray-300 opacity-60",
      title: "Available Space",
      cropId: "available",
    });
    currentSquare++;
  }

  return (
    <Card className="mt-8 bg-white shadow-garden" data-testid="card-garden-layout">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-semibold text-gray-900" data-testid="text-layout-title">Garden Layout Preview</CardTitle>
        <p className="text-garden-text" data-testid="text-layout-subtitle">Visual representation of your garden space allocation</p>
      </CardHeader>
      
      <CardContent className="p-6 lg:p-8">
        <div className="relative">
          {/* Grid Container */}
          <div 
            className="grid grid-cols-10 gap-1 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-garden-gray"
            style={{ aspectRatio: "1" }}
            data-testid="grid-garden-layout"
          >
            {gridSquares.map((square, index) => (
              <div
                key={index}
                className={`${square.color} rounded border`}
                title={square.title}
                data-testid={`grid-square-${index}`}
                data-crop-id={square.cropId}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center" data-testid="section-legend">
            {calculationResult.cropAnalysis.map((crop, index) => {
              const colorClass = CROP_COLORS[index % CROP_COLORS.length];
              return (
                <div key={crop.id} className="flex items-center space-x-2" data-testid={`legend-item-${crop.id}`}>
                  <div className={`w-4 h-4 ${colorClass} rounded`} />
                  <span className="text-sm text-garden-text" data-testid={`legend-text-${crop.id}`}>
                    {crop.name} ({crop.spaceUsed.toFixed(1)} ft²)
                  </span>
                </div>
              );
            })}
            <div className="flex items-center space-x-2" data-testid="legend-item-available">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded" />
              <span className="text-sm text-garden-text" data-testid="legend-text-available">
                Available Space ({calculationResult.availableSpace.toFixed(1)} ft²)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
