
import { StageData } from '../types';

export const calculateEmissions = (data: StageData): number => {
  let co2 = 0;
  
  // 1. Base Energy Emissions (Standard for all industrial stages)
  // Average Global grid intensity: ~0.45 kg CO2 per kWh
  const energyEmissions = (data.energyKwh || 0) * 0.45;
  co2 += energyEmissions;

  // 2. Process-Specific Thermal Multipliers
  // If targetTemp exists, we assume high-heat energy usage
  if (data.targetTemp) {
    const heatFactor = (data.targetTemp - 20) * 0.02; // Simple model for heat energy scaling
    co2 += heatFactor;
  }

  // 3. Pressure-based Multipliers (for extraction)
  if (data.pressureBar) {
    const compressionFactor = data.pressureBar * 0.1;
    co2 += compressionFactor;
  }

  // 4. Batch Size scaling
  if (data.batchSize) {
    // Emissions per kg usually decrease with scale, but total increases
    co2 += (data.batchSize * 0.01);
  }

  // 5. Environmental Penalty/Bonus
  if (data.envScore) {
    // If envScore is low (<70), add a small carbon penalty for inefficiency
    if (data.envScore < 70) {
      co2 *= 1.15;
    } else if (data.envScore > 90) {
      co2 *= 0.90; // Green efficiency bonus
    }
  }

  return parseFloat(co2.toFixed(2));
};

export const getEfficiencyScore = (totalEmissions: number): number => {
    // Map total emissions to a 0-100 efficiency score based on an arbitrary industrial baseline
    const score = Math.max(0, 100 - (totalEmissions / 5));
    return Math.round(score);
}
