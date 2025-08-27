import { INCOME_CATEGORIES } from '../config/schemaMappings.js';
import { EXPENSE_CATEGORIES } from '../config/schemaMappings.js';

export function getIncomeCategory(key) {
  const cat = INCOME_CATEGORIES.find(c => c.key === key);
  return cat ? cat.category : '';
}

export function getIncomeDescription(key) {
  const cat = INCOME_CATEGORIES.find(c => c.key === key);
  return cat ? cat.description : '';
}

export function getExpenseCategory(key) {
  const cat = EXPENSE_CATEGORIES.find(c => c.key === key);
  return cat ? cat.category : '';
}

export function getExpenseDescription(key) {
  const cat = EXPENSE_CATEGORIES.find(c => c.key === key);
  return cat ? cat.description : '';
}