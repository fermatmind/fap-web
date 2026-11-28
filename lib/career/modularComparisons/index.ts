import type { FixedComparisonLocale } from "../fixedComparisonPreview";
import type { ModularComparisonSpec } from "../modularComparison";
import { infosecComparisonZhSpec } from "./infosecComparisonZh";
import { electricalComparisonZhSpec } from "./electricalComparisonZh";
import { rehabilitationComparisonZhSpec } from "./rehabilitationComparisonZh";
import { creditComparisonZhSpec } from "./creditComparisonZh";
import { systemsWebComparisonZhSpec } from "./systemsWebComparisonZh";
import { electricalElectriciansComparisonZhSpec } from "./electricalElectriciansComparisonZh";
import { electricalElectriciansComparisonEnSpec } from "./electricalElectriciansComparisonEn";
import { electricalElectriciansComparisonZhTwSpec } from "./electricalElectriciansComparisonZhTw";
import { purchasingSupplyChainComparisonZhSpec } from "./purchasingSupplyChainComparisonZh";
import { chemicalChemistsComparisonZhSpec } from "./chemicalChemistsComparisonZh";
import { roboticsComparisonZhSpec } from "./roboticsComparisonZh";
import { interiorLandscapeComparisonZhSpec } from "./interiorLandscapeComparisonZh";
import { biostatisticsComparisonZhSpec } from "./biostatisticsComparisonZh";
import { complianceRegulatoryComparisonZhSpec } from "./complianceRegulatoryComparisonZh";
import { solarPhotovoltaicsComparisonZhSpec } from "./solarPhotovoltaicsComparisonZh";
import { manufacturingMechatronicsComparisonZhSpec } from "./manufacturingMechatronicsComparisonZh";
import { dieteticNutritionComparisonZhSpec } from "./dieteticNutritionComparisonZh";

import { rehabilitationComparisonEnSpec } from "./rehabilitationComparisonEn";
import { rehabilitationComparisonZhTwSpec } from "./rehabilitationComparisonZhTw";
import { electricalComparisonEnSpec } from "./electricalComparisonEn";
import { electricalComparisonZhTwSpec } from "./electricalComparisonZhTw";
import { chemicalChemistsComparisonEnSpec } from "./chemicalChemistsComparisonEn";
import { chemicalChemistsComparisonZhTwSpec } from "./chemicalChemistsComparisonZhTw";
import { purchasingSupplyChainComparisonEnSpec } from "./purchasingSupplyChainComparisonEn";
import { purchasingSupplyChainComparisonZhTwSpec } from "./purchasingSupplyChainComparisonZhTw";

import { creditComparisonEnSpec } from "./creditComparisonEn";
import { creditComparisonZhTwSpec } from "./creditComparisonZhTw";
import { roboticsComparisonEnSpec } from "./roboticsComparisonEn";
import { roboticsComparisonZhTwSpec } from "./roboticsComparisonZhTw";
import { interiorLandscapeComparisonEnSpec } from "./interiorLandscapeComparisonEn";
import { interiorLandscapeComparisonZhTwSpec } from "./interiorLandscapeComparisonZhTw";
import { biostatisticsComparisonEnSpec } from "./biostatisticsComparisonEn";
import { biostatisticsComparisonZhTwSpec } from "./biostatisticsComparisonZhTw";
import { systemsWebComparisonEnSpec } from "./systemsWebComparisonEn";
import { systemsWebComparisonZhTwSpec } from "./systemsWebComparisonZhTw";

import { infosecComparisonEnSpec } from "./infosecComparisonEn";
import { infosecComparisonZhTwSpec } from "./infosecComparisonZhTw";
import { complianceRegulatoryComparisonEnSpec } from "./complianceRegulatoryComparisonEn";
import { complianceRegulatoryComparisonZhTwSpec } from "./complianceRegulatoryComparisonZhTw";
import { solarPhotovoltaicsComparisonEnSpec } from "./solarPhotovoltaicsComparisonEn";
import { solarPhotovoltaicsComparisonZhTwSpec } from "./solarPhotovoltaicsComparisonZhTw";
import { manufacturingMechatronicsComparisonEnSpec } from "./manufacturingMechatronicsComparisonEn";
import { manufacturingMechatronicsComparisonZhTwSpec } from "./manufacturingMechatronicsComparisonZhTw";
import { dieteticNutritionComparisonEnSpec } from "./dieteticNutritionComparisonEn";
import { dieteticNutritionComparisonZhTwSpec } from "./dieteticNutritionComparisonZhTw";

const MODULAR_COMPARISON_SPECS: readonly ModularComparisonSpec[] = [
  infosecComparisonZhSpec,
  electricalComparisonZhSpec,
  rehabilitationComparisonZhSpec,
  creditComparisonZhSpec,
  systemsWebComparisonZhSpec,
  electricalElectriciansComparisonZhSpec,
  electricalElectriciansComparisonEnSpec,
  electricalElectriciansComparisonZhTwSpec,
  purchasingSupplyChainComparisonZhSpec,
  chemicalChemistsComparisonZhSpec,
  roboticsComparisonZhSpec,
  interiorLandscapeComparisonZhSpec,
  biostatisticsComparisonZhSpec,
  complianceRegulatoryComparisonZhSpec,
  solarPhotovoltaicsComparisonZhSpec,
  manufacturingMechatronicsComparisonZhSpec,
  dieteticNutritionComparisonZhSpec,
  rehabilitationComparisonEnSpec,
  rehabilitationComparisonZhTwSpec,
  electricalComparisonEnSpec,
  electricalComparisonZhTwSpec,
  chemicalChemistsComparisonEnSpec,
  chemicalChemistsComparisonZhTwSpec,
  purchasingSupplyChainComparisonEnSpec,
  purchasingSupplyChainComparisonZhTwSpec,
  creditComparisonEnSpec,
  creditComparisonZhTwSpec,
  roboticsComparisonEnSpec,
  roboticsComparisonZhTwSpec,
  interiorLandscapeComparisonEnSpec,
  interiorLandscapeComparisonZhTwSpec,
  biostatisticsComparisonEnSpec,
  biostatisticsComparisonZhTwSpec,
  systemsWebComparisonEnSpec,
  systemsWebComparisonZhTwSpec,
  infosecComparisonEnSpec,
  infosecComparisonZhTwSpec,
  complianceRegulatoryComparisonEnSpec,
  complianceRegulatoryComparisonZhTwSpec,
  solarPhotovoltaicsComparisonEnSpec,
  solarPhotovoltaicsComparisonZhTwSpec,
  manufacturingMechatronicsComparisonEnSpec,
  manufacturingMechatronicsComparisonZhTwSpec,
  dieteticNutritionComparisonEnSpec,
  dieteticNutritionComparisonZhTwSpec,
];

export function listModularComparisonSpecs(): readonly ModularComparisonSpec[] {
  return MODULAR_COMPARISON_SPECS;
}

export function getModularComparisonSpec(
  locale: FixedComparisonLocale,
  pairId: string
): ModularComparisonSpec | null {
  return MODULAR_COMPARISON_SPECS.find((spec) => spec.locale === locale && spec.pairId === pairId) ?? null;
}
