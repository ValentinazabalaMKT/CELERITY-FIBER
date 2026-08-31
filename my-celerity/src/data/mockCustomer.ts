import type { Account, Customer, Property, Unit } from "@/types";

// Properties are real, published Celerity Fiber case-study properties
// (docs/brand/FACT-SHEET.md) -- not invented names.
export const mockProperties: Property[] = [
  {
    id: "prop_grande",
    name: "The Grande Condo",
    address: "1500 Bay Rd",
    city: "Miami Beach",
    state: "FL",
    zip: "33139",
  },
  {
    id: "prop_wave",
    name: "The Wave",
    address: "2200 NW 87th Ave",
    city: "Doral",
    state: "FL",
    zip: "33172",
  },
];

export const mockUnits: Unit[] = [
  { id: "unit_1204", propertyId: "prop_grande", unitNumber: "1204" },
  { id: "unit_512", propertyId: "prop_wave", unitNumber: "512" },
];

export const mockAccounts: Account[] = [
  {
    id: "acct_primary",
    label: "Apartment",
    accountNumber: "CF-100482",
    propertyId: "prop_grande",
    unitId: "unit_1204",
    status: "active",
    isPrimary: true,
  },
  {
    id: "acct_secondary",
    label: "Vacation property",
    accountNumber: "CF-100839",
    propertyId: "prop_wave",
    unitId: "unit_512",
    status: "past_due",
    isPrimary: false,
  },
];

export const mockCustomer: Customer = {
  id: "cust_michael_anderson",
  firstName: "Michael",
  lastName: "Anderson",
  email: "demo@celerityfiber.com",
  phone: "(305) 555-0148",
  preferredLanguage: "English",
  billingAddress: "1500 Bay Rd, Unit 1204, Miami Beach, FL 33139",
  accounts: mockAccounts,
  activeAccountId: "acct_primary",
};

export function getProperty(propertyId: string): Property {
  const property = mockProperties.find((p) => p.id === propertyId);
  if (!property) throw new Error(`Unknown property: ${propertyId}`);
  return property;
}

export function getUnit(unitId: string): Unit {
  const unit = mockUnits.find((u) => u.id === unitId);
  if (!unit) throw new Error(`Unknown unit: ${unitId}`);
  return unit;
}

export function getAccount(accountId: string): Account {
  const account = mockAccounts.find((a) => a.id === accountId);
  if (!account) throw new Error(`Unknown account: ${accountId}`);
  return account;
}
