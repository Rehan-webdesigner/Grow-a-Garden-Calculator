export const DEFAULT_CROPS = [
  {
    name: "Tomato",
    spacePerPlant: 4,
    yieldPerPlant: 15,
    description: "Classic garden staple with high yield"
  },
  {
    name: "Lettuce", 
    spacePerPlant: 1,
    yieldPerPlant: 2,
    description: "Quick growing leafy green"
  },
  {
    name: "Carrot",
    spacePerPlant: 0.5,
    yieldPerPlant: 0.5,
    description: "Root vegetable, good for succession planting"
  },
  {
    name: "Bell Pepper",
    spacePerPlant: 3,
    yieldPerPlant: 8,
    description: "Colorful and productive"
  },
  {
    name: "Cucumber",
    spacePerPlant: 6,
    yieldPerPlant: 12,
    description: "Vine crop, needs vertical space"
  },
  {
    name: "Spinach",
    spacePerPlant: 0.8,
    yieldPerPlant: 1.5,
    description: "Cool season leafy green"
  },
  {
    name: "Zucchini",
    spacePerPlant: 9,
    yieldPerPlant: 20,
    description: "Very high yield, space intensive"
  },
  {
    name: "Mixed Herbs",
    spacePerPlant: 1,
    yieldPerPlant: 1,
    description: "Basil, oregano, thyme mix"
  },
  {
    name: "Broccoli",
    spacePerPlant: 2,
    yieldPerPlant: 3,
    description: "Cool season brassica"
  },
  {
    name: "Kale",
    spacePerPlant: 1.5,
    yieldPerPlant: 2.5,
    description: "Hardy leafy green"
  }
] as const;

export const SUFFICIENCY_THRESHOLDS = {
  insufficient: 15, // lbs per person per season
  borderline: 25,   // lbs per person per season
  // Above 25 lbs per person is considered sufficient
} as const;
