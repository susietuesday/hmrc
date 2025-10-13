const INCOME_CATEGORIES = [
  { key: 'periodAmount', category: 'Rent', description: 'Regular rent payments from tenants (e.g., monthly rent).' },
  { key: 'premiumsOfLeaseGrant', category: 'Lease Premium', description: 'A one-off payment for granting a lease.' },
  { key: 'reversePremiums', category: 'Reverse Premium', description: 'A payment you made to encourage someone to take a lease.' },
  { key: 'otherIncome', category: 'Other Property Income', description: 'Extra charges for services (e.g., cleaning, gardening) or other property-related income.' },
  { key: 'taxDeducted', category: 'Tax Deducted', description: 'Tax already taken off by an agent or tenant before paying you.' },
  { key: 'rentARoom.rentsReceived', category: 'Rent-a-Room', description: 'Income under the Rent-a-Room scheme (e.g., from a lodger in your home).' }
];

const EXPENSE_CATEGORIES = [
  { key: 'premisesRunningCosts', category: 'Premises Running Costs', description: 'Rent, rates, insurance, ground rents, and other running costs.' },
  { key: 'repairsAndMaintenance', category: 'Repairs and Maintenance', description: 'Repairs to the property (e.g., fixing leaks) and maintenance like repainting (not improvements).Repairs to the property (e.g., fixing leaks) and maintenance like repainting (not improvements).' },
  { key: 'financialCosts', category: 'Finance Costs', description: 'Mortgage interest, overdraft fees, and other loan or finance costs (not capital repayments).' },
  { key: 'professionalFees', category: 'Professional Fees', description: 'Fees for accountants, letting agents, legal advice, or other professional services.' },
  { key: 'costOfServices', category: 'Cost of Services', description: 'Expenses for services such as cleaning, gardening, or staff wages related to the property.' },
  { key: 'other', category: 'Other Expenses', description: 'Any other allowable property expenses incurred wholly for your rental business.' },
  { key: 'residentialFinancialCost', category: 'Residential Finance Costs', description: 'Tax relief on finance costs (restricted amount deductible from rental income).' },
  { key: 'travelCosts', category: 'Travel Costs', description: 'Car, van, or travel expenses incurred for managing or maintaining the property.' },
  { key: 'residentialFinancialCostsCarriedForward', category: 'Residential Finance Costs Carried Forward', description: 'Unrelieved residential finance costs brought forward to future years.' },
  { key: 'rentARoom.amountClaimed', category: 'Rent-a-Room Deduction', description: 'Amount claimed under the Rent-a-Room scheme (if eligible).' },
  { key: 'consolidatedExpenses', category: 'Consolidated Expenses', description: 'A single total figure for all allowable expenses for the period (if using simplified reporting).' }
];

const ADJUSTMENTS = [
  { key: 'balancingCharge', category: 'Balancing Charge' },
  { key: 'privateUseAdjustment', category: 'Private Use Adjustment' },
  { key: 'businessPremisesRenovationAllowanceBalancingCharges', category: 'Business Premises Renovation Balancing' },
  { key: 'nonResidentLandlord', category: 'Non-UK Resident Landlord' },
  { key: 'rentARoom.jointlyLet', category: 'Rent-a-Room: Jointly Let' }
];

const ALLOWANCES = [
  { key: 'annualInvestmentAllowance', category: 'Annual Investment Allowance' },
  { key: 'businessPremisesRenovationAllowance', category: 'Business Premises Renovation Allowance' },
  { key: 'otherCapitalAllowance', category: 'Other Capital Allowance' },
  { key: 'costOfReplacingDomesticItems', category: 'Cost of Replacing Domestic Items' },
  { key: 'zeroEmissionsCarAllowance', category: 'Zero Emissions Car Allowance' },
  { key: 'propertyIncomeAllowance', category: 'Property Income Allowance' },
  { key: 'structuredBuildingAllowance.amount', category: 'Structures and Buildings Allowance' },
  { key: 'structuredBuildingAllowance.firstYear.qualifyingDate', category: 'Qualifying Date' },
  { key: 'structuredBuildingAllowance.firstYear.qualifyingAmountExpenditure', category: 'Qualifying Expenditure Amount' },
  { key: 'structuredBuildingAllowance.building.name', category: 'Building Name' },
  { key: 'structuredBuildingAllowance.building.number', category: 'Building Number' },
  { key: 'structuredBuildingAllowance.building.postcode', category: 'Postcode' },
  { key: 'enhancedStructuredBuildingAllowance.amount', category: 'Enhanced Structures and Buildings Allowance' },
  { key: 'enhancedStructuredBuildingAllowance.firstYear.qualifyingDate', category: 'Qualifying Date' },
  { key: 'enhancedStructuredBuildingAllowance.firstYear.qualifyingAmountExpenditure', category: 'Qualifying Expenditure Amount' },
  { key: 'enhancedStructuredBuildingAllowance.building.name', category: 'Building Name' },
  { key: 'enhancedStructuredBuildingAllowance.building.number', category: 'Building Number' },
  { key: 'enhancedStructuredBuildingAllowance.building.postcode', category: 'Postcode' }
]

module.exports = {
    INCOME_CATEGORIES,
    EXPENSE_CATEGORIES,
    ADJUSTMENTS,
    ALLOWANCES
}