const test = require('node:test');
const assert = require('node:assert/strict');
const { seed, installment, assess, createApplication, decide } = require('./engine.js');
test('amortization repays principal and supports zero interest', () => {
  const payment = installment(600000, 12);
  assert.ok(Math.abs(payment - 56735.75797) < 0.01);
  let balance = 600000;
  for (let i = 0; i < 12; i++) balance = balance * 1.02 - payment;
  assert.ok(Math.abs(balance) < 0.00001);
  assert.equal(installment(600000, 12, 0), 50000);
  assert.throws(() => installment(-1, 12));
  assert.throws(() => installment(1000, 0));
  assert.throws(() => installment(NaN, 12));
});
test('demo risk separates stable cash flow from unaffordable requests', () => {
  const applicants = seed();
  assert.equal(assess(applicants[0]).band, 'Low');
  assert.equal(assess(applicants[5]).band, 'High');
  assert.equal(assess({ ...applicants[0], stability: 70 }).band, 'Moderate');
  assert.equal(assess({ ...applicants[0], expenses: 300000 }).band, 'High');
  assert.ok(assess(applicants[0], 300000).coverage > assess(applicants[0]).coverage);
});
test('application validation enforces consent and finite supported terms', () => {
  const valid = { name: 'Zara Shah', city: 'Lahore', type: 'SME finance', income: '200000', expenses: '100000', amount: '500000', months: '12', consent: 'on' };
  const a = createApplication(valid, 'SK-1049');
  assert.equal(a.status, 'Pending');
  assert.equal(a.income, 200000);
  for (const patch of [{ consent: '' }, { income: 'NaN' }, { income: 'Infinity' }, { expenses: '-1' }, { amount: '2000001' }, { months: '0' }, { months: '13' }, { name: ' ' }, { type: 'Unknown' }]) assert.throws(() => createApplication({ ...valid, ...patch }, 'SK-1049'));
});
test('decisions preserve applicant and forbid oversized offers or repeat final decisions', () => {
  const a = seed()[0];
  const approved = decide(a, 'Approved', 500000, 18);
  assert.equal(approved.offerAmount, 500000);
  assert.equal(approved.status, 'Approved');
  assert.equal(a.status, 'Pending');
  assert.throws(() => decide(a, 'Approved', 700000, 12));
  assert.throws(() => decide(a, 'Approved', 500000, 13));
  assert.throws(() => decide(a, 'Unknown', 500000, 12));
  assert.throws(() => decide(approved, 'Declined', 500000, 18));
  assert.equal(decide(decide(a, 'Review', 500000, 12), 'Approved', 500000, 12).status, 'Approved');
});
test('reset uses an independent copy of the original sample data', () => {
  const a = seed(); a[0].status = 'Declined'; a[0].history[0] = 0;
  assert.equal(seed()[0].status, 'Pending');
  assert.equal(seed()[0].history[0], 210);
});
