# Saakh — Credit, with context.

A standalone, interactive cofounder-pitch prototype for a cash-flow based lending platform in Pakistan. The school backend is not used or modified. No packages need to be installed.

## Run

Open [index.html](./index.html) directly in a modern browser, or run from this folder:

```sh
npm start
```

Visit http://127.0.0.1:4173. Run `npm test` for the calculation, validation, and decision checks.

## A three-minute pitch

1. Start at **Overview**. Open **Explore the vision** for the product thesis.
2. Open **Applications**, review Ayesha Khan, and explain the income, expenses, stability, and repayment-coverage signals.
3. Change the offer amount or term, expand the repayment schedule, and approve the offer. Dashboard metrics and Portfolio update immediately.
4. Switch to **Borrower experience** and submit a fictional applicant. Switch back to Applications and approve it. Return to Borrower experience to see the same applicant's updated offer.
5. Try search and risk/status filters. Export a CSV snapshot, or reset with the circular arrow in the top bar.

## What is simulated

- All seeded identities, financial values, historical chart values, and outcomes are fictional. The historical demand chart is a fixed illustration; summary metrics and risk distribution derive from the current applications.
- The score is an illustrative rule, not a trained model. Low risk requires monthly surplus/payment >= 1.5 and stability >= 80; moderate requires >= 1 and >= 60. Everything else is high risk. Lender decisions can override these suggestions.
- Newly submitted applicants receive an explicitly assumed stability of 80/100. No bank transactions are imported or verified.
- Repayments use a 24% nominal annual rate with monthly reducing-balance amortization, excluding fees and taxes. Display values are rounded to whole rupees.
- All actions stay in browser memory and reset when the page reloads. No data is submitted to the server. Google Fonts is optional; system fonts work offline.
- There is no login, bank integration, live scoring model, disbursement, document collection, or real lending. The local server exposes only the five public demo assets and listens on loopback.

Before building a real product, validate the bank-data access strategy, lender partnerships, model quality, and business model. The prototype is intended to start that cofounder conversation.
