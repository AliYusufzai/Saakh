'use strict';
const { seed, assess, installment, createApplication, decide } = Saakh;
let applications = seed();
let view = 'overview';
let borrowerId = null;
let selectedId = null;
let nextId = 1049;
let toastTimer;
const main = document.getElementById('main');
const money = value => 'PKR ' + Math.round(value).toLocaleString('en-PK');
const compact = value => value >= 1000000 ? (value / 1000000).toFixed(2) + 'M' : Math.round(value / 1000) + 'K';
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const initials = name => escape(name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase());
const paths = { grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', files: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5"/>', chart: '<path d="M4 3v17h17M8 15V9M13 15V5M18 15v-5"/>', phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>', reset: '<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>', arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', wallet: '<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 8V5a2 2 0 0 1 2-2h12v3M16 12h5v5h-5z"/>', check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' };
const icon = name => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.grid}</svg>`;
document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
function toast(message) { const el = document.getElementById('toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500); }
function badge(status) { return `<span class="badge ${status}">${status === 'Review' ? 'In review' : status}</span>`; }
function person(a) { return `<div class="person"><span class="avatar">${initials(a.name)}</span><div><strong>${escape(a.name)}</strong><small>${escape(a.business)} · ${escape(a.city)}</small></div></div>`; }
function metrics() {
  const approved = applications.filter(a => a.status === 'Approved');
  const volume = approved.reduce((sum, a) => sum + (a.offerAmount || a.amount), 0);
  const pending = applications.filter(a => ['Pending', 'Review'].includes(a.status)).length;
  const cards = [
    ['Approved volume', `<span class="currency">PKR</span>${compact(volume)}`, `${approved.length} approved offers · not disbursed`, 'wallet'],
    ['Total applications', applications.length.toString().padStart(2, '0'), 'Across consumer & SME lending', 'files'],
    ['Approval rate', `${Math.round(approved.length / applications.length * 100)}<span class="currency">%</span>`, 'Approved / all demo applications', 'check'],
    ['Awaiting decision', pending.toString().padStart(2, '0'), '<span>Ready for your review</span>', 'clock']
  ];
  return `<div class="metrics">${cards.map(([title, value, note, image]) => `<article class="metric"><div class="metric-top">${title}${icon(image)}</div><div class="metric-value">${value}</div><small>${note}</small></article>`).join('')}</div>`;
}
function heading(title, subtitle, action = '<button class="secondary" data-action="export">' + icon('download') + 'Export snapshot</button>') { return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${action}</div>`; }
function table(rows) {
  if (!rows.length) return '<div class="empty">No applications match these filters.</div>';
  return `<div class="table-wrap"><table><thead><tr><th>APPLICANT</th><th>REQUESTED AMOUNT</th><th>DEMO SCORE</th><th>RISK LEVEL</th><th>STATUS</th><th><span class="sr-only">ACTION</span></th></tr></thead><tbody>${rows.map(a => {
    const result = assess(a);
    return `<tr><td>${person(a)}</td><td><strong>${money(a.amount)}</strong><small>${a.type} · ${a.months} months</small></td><td><span class="score">${result.score}<small>/ 1000</small></span></td><td>${badge(result.band)}</td><td>${badge(a.status)}</td><td><button class="row-button" data-open="${a.id}" aria-label="Review ${escape(a.name)}">View ${icon('arrow')}</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function riskPanel() {
  const counts = ['Low', 'Moderate', 'High'].map(band => applications.filter(a => assess(a).band === band).length);
  const first = counts[0] / applications.length * 100, second = (counts[0] + counts[1]) / applications.length * 100;
  return `<section class="panel"><div class="panel-head"><div><h2>A clearer picture of risk</h2><p>All applications · illustrative assessment</p></div>${icon('chart')}</div><div class="risk-body"><div class="donut" role="img" aria-label="${counts[0]} low risk, ${counts[1]} moderate risk, ${counts[2]} high risk applications" style="background:conic-gradient(#224e3f 0 ${first}%,#aec58b ${first}% ${second}%,#e4bb8a ${second}% 100%)"><div class="donut-inner"><strong>${applications.length}</strong><small>applicants assessed</small></div></div><div class="risk-legend">${counts.map((count, i) => `<div class="risk-row"><span><i class="legend-dot" style="background:${['#224e3f', '#aec58b', '#e4bb8a'][i]}"></i>${['Low risk', 'Moderate', 'High risk'][i]}</span><strong>${count}</strong></div>`).join('')}</div></div><p class="risk-note">Context over guesswork. Each demo assessment includes cash flow, income stability, and repayment coverage.</p></section>`;
}
function overview() {
  return heading('A better view of possibility.', 'Welcome back. Here’s where your lending opportunities stand.') + `<section class="hero"><div><span class="eyebrow">CREDIT, WITH CONTEXT.</span><h2>Behind every application,<br>there’s <em>a bigger story.</em></h2><p>Turn everyday cash flow into meaningful credit insights.<br>Find the potential that traditional scores might miss.</p></div><div class="hero-action"><button class="primary" data-view="applications">Explore applications ${icon('arrow')}</button><small>Transparent signals. Informed decisions.</small></div></section>` + metrics() + `<div class="analytics"><section class="panel"><div class="panel-head"><div><h2>Opportunity, over time</h2><p>Illustrative monthly lending demand</p></div><span class="period">May – Oct 2026</span></div><div class="chart-summary"><strong>PKR 8.4M</strong><span class="chip">Sample trend</span></div><svg class="chart" viewBox="0 0 560 180" role="img" aria-label="Illustrative requested volume rises from 2.1 million in May to 8.4 million rupees in October; eligible volume rises from 1.5 to 6.2 million."><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#b4cd8c" stop-opacity=".35"/><stop offset="1" stop-color="#b4cd8c" stop-opacity="0"/></linearGradient></defs><line x1="40" y1="25" x2="550" y2="25"/><line x1="40" y1="65" x2="550" y2="65"/><line x1="40" y1="105" x2="550" y2="105"/><line x1="40" y1="145" x2="550" y2="145"/><text x="2" y="29">9M</text><text x="2" y="69">6M</text><text x="2" y="109">3M</text><text x="9" y="149">0</text><path d="M45 117C95 117 106 100 146 104S210 80 248 84S311 58 350 65S412 42 452 49S507 26 548 33L548 145H45Z" fill="url(#chart-fill)"/><path d="M45 125C95 125 106 114 146 118S210 100 248 105S311 84 350 91S412 66 452 77S507 55 548 62" fill="none" stroke="#a6bc89" stroke-width="2" stroke-dasharray="5 5"/><path d="M45 117C95 117 106 100 146 104S210 80 248 84S311 58 350 65S412 42 452 49S507 26 548 33" fill="none" stroke="#244c3c" stroke-width="2.7"/><circle cx="548" cy="33" r="4" fill="#244c3c" stroke="white" stroke-width="2"/><text x="40" y="173">May</text><text x="140" y="173">Jun</text><text x="242" y="173">Jul</text><text x="344" y="173">Aug</text><text x="446" y="173">Sep</text><text x="532" y="173">Oct</text></svg><div class="chart-caption"><span><i class="legend-dot"></i>Requested volume</span><span><i class="legend-dot lime"></i>Eligible volume</span><span>Fictional historical series</span></div></section>${riskPanel()}</div><section class="panel table-panel"><div class="panel-head"><div><h2>Every application is an opportunity</h2><p>Your latest applicants, ready for a closer look.</p></div><button class="text-button" data-view="applications">View all →</button></div>${table(applications.slice(0, 4))}</section>`;
}
function applicationPage() { return heading('The next opportunity.', 'Review the financial story behind every application.') + `<div class="filters"><input id="search" class="search" type="search" aria-label="Search applicants" placeholder="Search name, city, or application ID…"><select id="status-filter" aria-label="Filter by status"><option value="">All statuses</option><option>Pending</option><option>Review</option><option>Approved</option><option>Declined</option></select><select id="risk-filter" aria-label="Filter by risk"><option value="">All risk levels</option><option value="Low">Low risk</option><option value="Moderate">Moderate risk</option><option value="High">High risk</option></select></div><section class="panel table-panel" id="application-table">${table(applications)}</section><p class="decision-note">Scores use transparent demonstration rules, not a trained AI model. New borrower applications use an assumed stability signal of 80/100.</p>`; }
function filterApplications() {
  const search = document.getElementById('search').value.toLowerCase();
  const status = document.getElementById('status-filter').value, risk = document.getElementById('risk-filter').value;
  const rows = applications.filter(a => `${a.name} ${a.city} ${a.id}`.toLowerCase().includes(search) && (!status || a.status === status) && (!risk || assess(a).band === risk));
  document.getElementById('application-table').innerHTML = table(rows);
}
function portfolio() {
  const approved = applications.filter(a => a.status === 'Approved');
  return heading('Potential, put into motion.', 'Your approved offers, with transparent repayment estimates.') + metrics() + `<div class="notice">These are approved demo offers. No money has been disbursed, no repayments have been collected, and no bank is connected.</div><div class="portfolio-grid">${approved.map(a => { const amount = a.offerAmount || a.amount, months = a.offerMonths || a.months; return `<article class="portfolio-card"><div class="panel-head">${person(a)}${badge('Approved')}</div><dl><div><dt>Approved offer</dt><dd>${money(amount)}</dd></div><div><dt>Monthly estimate</dt><dd>${money(installment(amount, months))}</dd></div><div><dt>Term</dt><dd>${months} months</dd></div><div><dt>Illustrative annual rate</dt><dd>24%</dd></div></dl><button class="row-button" data-open="${a.id}">View offer & schedule →</button><div class="progress-track"></div><small>0 of ${months} payments collected · Simulation</small></article>`; }).join('') || '<div class="empty">Approve an application to see its offer here.</div>'}</div>`;
}
function borrower() {
  const applicant = applications.find(a => a.id === borrowerId);
  return heading('Your next chapter starts here.', 'Preview the experience your borrowers could have.', '<span class="sandbox-badge">Borrower preview</span>') + `<div class="borrower-layout"><section class="borrower-intro"><span class="eyebrow">SAAKH FOR YOU</span><h2>Your ambition.<br>Your story.<br><em>Your possibilities.</em></h2><p>A simple path from application to opportunity.<br>Credit that looks at how you earn, not just your past.</p>${[['Tell your story', 'A few details about you and your finances.'], ['See the bigger picture', 'Cash flow helps inform a lender’s review.'], ['Take your next step', 'Explore your offer and repayment plan.']].map(([title, text], i) => `<div class="journey-step"><span class="step-number">0${i + 1}</span><div><h3>${title}</h3><p>${text}</p></div></div>`).join('')}<p style="margin-top:32px;font-size:10px">Prototype only. Use fictional information.<br>No CNIC, bank credentials, or documents needed.</p></section><section class="panel borrower-form">${applicant ? borrowerStatus(applicant) : borrowerForm()}</section></div>`;
}
function borrowerForm() { return `<h2>Let’s get to know you.</h2><p class="form-subtitle">Try a fictional application. It will appear in the lender’s queue immediately.</p><form id="borrower-form"><div class="form-grid"><label class="field">Full name<input name="name" required minlength="2" maxlength="70" placeholder="e.g. Zara Shah" autocomplete="off"></label><label class="field">City<input name="city" required minlength="2" maxlength="50" placeholder="e.g. Lahore" autocomplete="off"></label><label class="field full">Loan purpose<select name="type"><option>SME finance</option><option>Personal loan</option></select></label><label class="field">Monthly income (PKR)<input name="income" type="number" required min="10000" max="10000000" step="1" placeholder="200000"></label><label class="field">Monthly expenses (PKR)<input name="expenses" type="number" required min="0" max="10000000" step="1" placeholder="100000"></label><label class="field">Requested amount (PKR)<input name="amount" type="number" required min="50000" max="2000000" step="1" placeholder="500000"><small>PKR 50,000 – 2,000,000</small></label><label class="field">Repayment period<select name="months"><option value="6">6 months</option><option value="12" selected>12 months</option><option value="18">18 months</option><option value="24">24 months</option></select></label></div><label class="consent"><input type="checkbox" name="consent" required>I’m using fictional information and understand this is a demo, not a real loan application.</label><div class="error" id="form-error" role="alert"></div><button class="primary wide" type="submit">Submit demo application ${icon('arrow')}</button><small style="text-align:center;margin-top:12px">No data is sent to a server. Resets on page reload.</small></form>`; }
function borrowerStatus(a) {
  const amount = a.offerAmount || a.amount, months = a.offerMonths || a.months;
  let message = 'Your demo application is in the lender’s queue. Switch to Applications to review it and make a decision.';
  if (a.status === 'Approved') message = 'Your demo offer is ready. Here is what the repayment plan would look like.';
  if (a.status === 'Declined') message = 'The lender declined this simulated application. This outcome has no effect on any real credit record.';
  if (a.status === 'Review') message = 'The lender has marked this application for a closer review. No final decision has been made.';
  return `<div class="submission"><div class="success-icon">${a.status === 'Approved' ? '✓' : '↗'}</div><span class="eyebrow">${a.id}</span><h2 style="margin-top:10px">${a.status === 'Approved' ? 'A new possibility.' : 'Your story is with us.'}</h2><p>${escape(a.name)}, ${message}</p><div class="status-card"><small>APPLICATION STATUS</small><strong>${badge(a.status)}</strong><small>${a.type} · ${money(a.amount)} requested</small></div>${a.status === 'Approved' ? `<div class="offer-numbers"><div><small>Approved amount</small><strong>${money(amount)}</strong></div><div><small>Estimated monthly payment</small><strong>${money(installment(amount, months))}</strong></div></div><p class="decision-note">${months} monthly payments · 24% nominal annual rate · reducing balance · no fees included. Illustrative terms only.</p><button class="secondary wide" style="margin-top:20px" data-open="${a.id}">View repayment schedule →</button>` : '<button class="primary wide" data-view="applications">Switch to lender review →</button>'}<button class="text-button" style="margin-top:20px" data-action="new-application">Try another demo application →</button></div>`;
}
function render() {
  const labels = { overview: 'Overview', applications: 'Applications', portfolio: 'Portfolio', borrower: 'Borrower experience' };
  main.innerHTML = ({ overview, applications: applicationPage, portfolio, borrower })[view]();
  main.classList.remove('page-enter'); void main.offsetWidth; main.classList.add('page-enter');
  document.getElementById('breadcrumb').textContent = labels[view];
  document.querySelectorAll('.nav-button').forEach(button => { button.classList.toggle('active', button.dataset.view === view); if (button.dataset.view === view) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  document.getElementById('queue-count').textContent = applications.filter(a => ['Pending', 'Review'].includes(a.status)).length;
}
function navigate(next) { if (!['overview', 'applications', 'portfolio', 'borrower'].includes(next)) return; view = next; history.replaceState(null, '', '#' + next); render(); main.focus({ preventScroll: true }); window.scrollTo({ top: 0 }); }
function showDetail(id) {
  selectedId = id;
  const a = applications.find(item => item.id === id);
  if (!a) return;
  const result = assess(a), final = ['Approved', 'Declined'].includes(a.status);
  const amount = a.offerAmount || a.amount, months = a.offerMonths || a.months;
  document.getElementById('detail-content').innerHTML = `<button class="close-button" data-close="detail-dialog" aria-label="Close applicant">×</button><div class="detail-header"><span class="avatar">${initials(a.name)}</span><div><span class="eyebrow">${a.id} / ${a.type}</span><h2 id="detail-title">${escape(a.name)}</h2><small>${escape(a.business)} · ${escape(a.city)} · ${badge(a.status)}</small></div></div><div class="detail-grid"><section class="assessment"><span class="eyebrow">ILLUSTRATIVE CREDIT SCORE</span><div class="big-score">${result.score}<span> / 1000</span></div>${badge(result.band)}<p>${result.recommendation}. Based on the original request. This is a rule-based demo, not a validated credit rating.</p></section><section><h3>The story behind the score</h3><dl class="signal-list"><div><dt>Monthly income</dt><dd>${money(a.income)}</dd></div><div><dt>Monthly expenses</dt><dd>${money(a.expenses)}</dd></div><div><dt>Available cash flow</dt><dd>${money(result.surplus)}</dd></div><div><dt>Income stability${a.history ? '' : ' (assumed)'}</dt><dd>${a.stability}/100</dd></div><div><dt>Cash flow / requested payment</dt><dd>${result.coverage.toFixed(2)}×</dd></div></dl></section></div>${a.history ? `<div class="notice"><strong>Six-month income trail (fictional)</strong><br>${a.history.map(value => money(value * 1000)).join(' → ')}<br>Demo policy: low risk requires stability ≥ 80 and cash flow ≥ 1.5× the monthly payment; moderate requires ≥ 60 and ≥ 1×.</div>` : '<div class="notice">This application uses your entered cash flow and an assumed stability of 80/100. No account transactions have been imported or verified.</div>'}<section class="detail-terms"><h3>${final ? 'Recorded decision' : 'Shape the offer'}</h3>${final ? `<p class="form-subtitle">${a.status === 'Approved' ? `${money(amount)} over ${months} months. Approved in the demo; not disbursed.` : 'Application declined in the demo. No offer was issued.'}</p>` : `<div class="form-grid"><label class="field">Offer amount (PKR)<input id="offer-amount" type="number" min="50000" max="${a.amount}" step="1" value="${amount}" required></label><label class="field">Repayment period<select id="offer-months">${[6, 12, 18, 24].map(m => `<option value="${m}" ${m === months ? 'selected' : ''}>${m} months</option>`).join('')}</select></label></div>`}${a.status !== 'Declined' ? '<div id="offer-preview"></div>' : ''}<div class="error" id="decision-error" role="alert"></div>${!final ? `<div class="decision-buttons"><button class="primary" data-decision="Approved">Approve offer ✓</button><button class="secondary" data-decision="Review">Manual review</button><button class="secondary danger" data-decision="Declined">Decline</button></div>` : ''}<p class="decision-note">24% illustrative nominal annual rate, compounded monthly on a reducing balance. Estimates exclude fees and taxes. A lender can override the demo recommendation.</p></section>`;
  if (a.status !== 'Declined') updateOffer();
  const dialog = document.getElementById('detail-dialog');
  if (!dialog.open) dialog.showModal();
}
function updateOffer() {
  const a = applications.find(item => item.id === selectedId);
  const amountInput = document.getElementById('offer-amount');
  const amount = amountInput ? Number(amountInput.value) : a.offerAmount || a.amount;
  const months = Number(document.getElementById('offer-months')?.value || a.offerMonths || a.months);
  const el = document.getElementById('offer-preview');
  if (!el) return;
  if (amount < 50000 || amount > a.amount || !Number.isFinite(amount)) { el.innerHTML = '<p class="error" style="margin-top:15px">Enter an offer between PKR 50,000 and the requested amount.</p>'; return; }
  const result = assess(a, amount, months), total = result.payment * months;
  let balance = amount;
  const schedule = Array.from({ length: months }, (_, i) => { const interest = balance * .02, principal = result.payment - interest; balance = Math.max(0, balance - principal); return `<tr><td>Month ${i + 1}</td><td>${money(result.payment)}</td><td>${money(principal)}</td><td>${money(interest)}</td><td>${money(balance)}</td></tr>`; }).join('');
  el.innerHTML = `<div class="offer-numbers"><div><small>Estimated monthly payment</small><strong>${money(result.payment)}</strong></div><div><small>Total repayment</small><strong>${money(total)}</strong></div></div><p class="decision-note">Offer assessment: <strong>${result.band} risk</strong> · Cash-flow coverage ${result.coverage.toFixed(2)}× · Estimated interest ${money(total - amount)}.</p><details><summary class="text-button" style="margin-top:12px;cursor:pointer">View estimated repayment schedule</summary><div class="repayment-table"><table><thead><tr><th>PAYMENT</th><th>TOTAL</th><th>PRINCIPAL</th><th>INTEREST</th><th>BALANCE</th></tr></thead><tbody>${schedule}</tbody></table></div><small>Amounts rounded to whole rupees for display.</small></details>`;
}
function exportSnapshot() {
  const header = ['ID', 'Applicant', 'City', 'Requested PKR', 'Status', 'Demo score', 'Demo risk', 'Approved offer PKR'];
  const rows = applications.map(a => [a.id, a.name, a.city, a.amount, a.status, assess(a).score, assess(a).band, a.status === 'Approved' ? a.offerAmount || a.amount : '']);
  const cell = value => '"' + String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""') + '"';
  const csv = [header, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'saakh-demo-snapshot.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Demo snapshot exported.');
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.view) navigate(button.dataset.view);
  if (button.dataset.open) showDetail(button.dataset.open);
  if (button.dataset.close) document.getElementById(button.dataset.close).close();
  if (button.id === 'story-button') document.getElementById('story-dialog').showModal();
  if (button.id === 'reset-button' && confirm('Reset all demo applications and decisions to the sample dataset?')) { applications = seed(); nextId = 1049; borrowerId = null; render(); toast('Demo reset to the original sample data.'); }
  if (button.dataset.action === 'export') exportSnapshot();
  if (button.dataset.action === 'new-application') { borrowerId = null; render(); }
  if (button.dataset.decision) {
    const index = applications.findIndex(a => a.id === selectedId);
    try {
      applications[index] = decide(applications[index], button.dataset.decision, Number(document.getElementById('offer-amount').value), Number(document.getElementById('offer-months').value));
      document.getElementById('detail-dialog').close(); render(); toast(`Application ${button.dataset.decision === 'Review' ? 'sent for review' : button.dataset.decision.toLowerCase()}. Demo decision recorded.`);
    } catch (error) { document.getElementById('decision-error').textContent = error.message; }
  }
});
document.addEventListener('input', event => { if (event.target.id === 'search') filterApplications(); if (event.target.id === 'offer-amount') updateOffer(); });
document.addEventListener('change', event => { if (['status-filter', 'risk-filter'].includes(event.target.id)) filterApplications(); if (event.target.id === 'offer-months') updateOffer(); });
document.addEventListener('submit', event => {
  if (event.target.id !== 'borrower-form') return;
  event.preventDefault();
  try { const values = Object.fromEntries(new FormData(event.target)); const a = createApplication(values, `SK-${nextId}`); nextId++; applications.unshift(a); borrowerId = a.id; render(); main.focus(); toast('Demo application submitted to the lender queue.'); }
  catch (error) { document.getElementById('form-error').textContent = error.message; }
});
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
if (['overview', 'applications', 'portfolio', 'borrower'].includes(location.hash.slice(1))) view = location.hash.slice(1);
render();
