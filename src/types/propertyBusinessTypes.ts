export interface UKPropertyCumulativePeriodSummaryRequest {
  periodStartDate: string; // "YYYY-MM-DD"
  periodEndDate: string;   // "YYYY-MM-DD"
  ukProperty: {
    income: {
        premiumsOfLeaseGrant?: number;
        reversePremiums?: number;
        periodAmount?: number;
        taxDeducted?: number;
        otherIncome?: number;
        rentARoom?: {
          rentsReceived?: number;
        };
    };
    expenses?: {
        premisesRunningCosts?: number;
        repairsAndMaintenance?: number;
        financialCosts?: number;
        professionalFees?: number;
        costOfServices?: number;
        other?: number;
        residentialFinancialCosts?: number;
        travelCosts?: number;
        residentialFinancialCostsCarriedForward?: number;
        rentARoom?: {
          amountClaimed?: number;
        };
        consolidatedExpenses?: number;
    };
  };
}
