(function (root) {
  'use strict';
  const seeds = [
    { id: 'SK-1048', name: 'Ayesha Khan', city: 'Lahore', business: 'Design studio', type: 'SME finance', income: 285000, expenses: 151000, amount: 600000, months: 12, stability: 94, status: 'Pending', history: [210, 238, 226, 260, 272, 285] },
    { id: 'SK-1047', name: 'Hamza Ahmed', city: 'Karachi', business: 'Software engineer', type: 'Personal loan', income: 180000, expenses: 98000, amount: 350000, months: 12, stability: 97, status: 'Pending', history: [175, 180, 180, 180, 180, 180] },
    { id: 'SK-1046', name: 'Fatima Ali', city: 'Islamabad', business: 'Online retail', type: 'SME finance', income: 220000, expenses: 175000, amount: 800000, months: 12, stability: 64, status: 'Review', history: [270, 180, 240, 150, 260, 220] },
    { id: 'SK-1045', name: 'Bilal Hassan', city: 'Faisalabad', business: 'Textile supplier', type: 'SME finance', income: 450000, expenses: 260000, amount: 1200000, months: 18, stability: 88, status: 'Approved', history: [360, 390, 370, 425, 440, 450] },
    { id: 'SK-1044', name: 'Mariam Raza', city: 'Rawalpindi', business: 'School teacher', type: 'Personal loan', income: 95000, expenses: 55000, amount: 200000, months: 12, stability: 98, status: 'Approved', history: [90, 90, 95, 95, 95, 95] },
    { id: 'SK-1043', name: 'Usman Malik', city: 'Multan', business: 'Mobile accessories', type: 'SME finance', income: 120000, expenses: 112000, amount: 500000, months: 12, stability: 48, status: 'Declined', history: [160, 100, 145, 85, 110, 120] }
  ];
  function installment(amount, months, annualRate = 24) {
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(months) || months <= 0 || !Number.isFinite(annualRate) || annualRate < 0) throw new Error('Invalid loan terms.');
    const r = annualRate / 1200;
    return r === 0 ? amount / months : amount * r / (1 - Math.pow(1 + r, -months));
  }
  // shortcut: illustrative rules only; replace with a validated model and lender policy before real underwriting.
  function assess(applicant, amount = applicant.amount, months = applicant.months) {
    const surplus = applicant.income - applicant.expenses;
    const payment = installment(amount, months);
    const coverage = surplus / payment;
    const score = Math.round(Math.min(920, Math.max(300, 400 + applicant.stability * 3 + Math.min(coverage, 4) * 55)));
    const band = coverage >= 1.5 && applicant.stability >= 80 ? 'Low' : coverage >= 1 && applicant.stability >= 60 ? 'Moderate' : 'High';
    return { surplus, payment, coverage, score, band, recommendation: band === 'Low' ? 'Eligible for approval' : band === 'Moderate' ? 'Manual review suggested' : 'Outside demo policy' };
  }
  function createApplication(values, id) {
    const name = String(values.name || '').trim();
    const city = String(values.city || '').trim();
    const income = Number(values.income), expenses = Number(values.expenses), amount = Number(values.amount), months = Number(values.months);
    if (name.length < 2 || name.length > 70 || city.length < 2 || city.length > 50) throw new Error('Enter a name and city using the stated length limits.');
    if (![income, expenses, amount, months].every(Number.isFinite) || income < 10000 || income > 10000000 || expenses < 0 || expenses > 10000000 || amount < 50000 || amount > 2000000 || ![6, 12, 18, 24].includes(months)) throw new Error('Check the income, expense, amount, and repayment fields.');
    if (!['Personal loan', 'SME finance'].includes(values.type)) throw new Error('Select a supported loan purpose.');
    if (!values.consent) throw new Error('Confirm that you are submitting fictional demo information.');
    return { id, name, city, income, expenses, amount, months, type: values.type, business: 'Demo applicant', stability: 80, history: null, status: 'Pending' };
  }
  function decide(applicant, status, amount, months) {
    if (!['Approved', 'Declined', 'Review'].includes(status)) throw new Error('Invalid decision.');
    if (['Approved', 'Declined'].includes(applicant.status)) throw new Error('This application already has a final decision.');
    if (!Number.isFinite(amount) || amount < 50000 || amount > applicant.amount || ![6, 12, 18, 24].includes(months)) throw new Error('Offer must be between PKR 50,000 and the requested amount.');
    return { ...applicant, status, offerAmount: amount, offerMonths: months, decidedAt: new Date().toISOString() };
  }
  const api = { seed: () => structuredClone(seeds), installment, assess, createApplication, decide };
  if (typeof module !== 'undefined') module.exports = api;
  else root.Saakh = api;
})(globalThis);
