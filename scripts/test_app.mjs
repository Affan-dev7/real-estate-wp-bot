import assert from 'node:assert';

// 1. Test Currency Formatter
function formatPkr(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Price on request';
  }
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    const crores = amount / 10000000;
    const formatted = parseFloat(crores.toFixed(2)).toString();
    return `${formatted} crore`;
  }
  if (abs >= 100000) {
    const lakhs = amount / 100000;
    const formatted = parseFloat(lakhs.toFixed(2)).toString();
    return `${formatted} lakh`;
  }
  return `${amount.toLocaleString('en-PK')} PKR`;
}

assert.strictEqual(formatPkr(145000000), '14.5 crore');
assert.strictEqual(formatPkr(25000000), '2.5 crore');
assert.strictEqual(formatPkr(49000000), '4.9 crore');
assert.strictEqual(formatPkr(8500000), '85 lakh');
assert.strictEqual(formatPkr(750000), '7.5 lakh');
assert.strictEqual(formatPkr(null), 'Price on request');
console.log('✓ PKR Currency formatting tests passed.');

// 2. Test Pakistani Phone Number Formatting & Links
function formatPhone(phone) {
  if (!phone) return '';
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }
  if (digits.startsWith('92') && digits.length === 12) {
    return `+92 ${digits.substring(2, 5)} ${digits.substring(5)}`;
  }
  return phone.startsWith('+') ? phone : `+${digits}`;
}

function getWhatsAppUrl(phone, msg) {
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }
  const base = `https://wa.me/${digits}`;
  return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
}

assert.strictEqual(formatPhone('03008251940'), '+92 300 8251940');
assert.strictEqual(formatPhone('+923008251940'), '+92 300 8251940');
assert.strictEqual(getWhatsAppUrl('03008251940'), 'https://wa.me/923008251940');
console.log('✓ Phone & WhatsApp formatting tests passed.');

// 3. Test Instagram URL Validation
const igRegex = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[\w-]+\/?(\?.*)?$/i;
assert.strictEqual(igRegex.test('https://www.instagram.com/reel/C8qA12bI3dO/'), true);
assert.strictEqual(igRegex.test('https://instagram.com/p/C7u18zXyB90/'), true);
assert.strictEqual(igRegex.test('https://youtube.com/watch?v=123'), false);
assert.strictEqual(igRegex.test('https://tiktok.com/@property/video/123'), false);
console.log('✓ Instagram URL validation tests passed.');

// 4. Test Lead Requirement Summary
function getRequirementSummary(lead) {
  const parts = [];
  if (lead.wants_size) parts.push(lead.wants_size);
  else if (lead.wants_type) parts.push(lead.wants_type);
  if (lead.wants_area) parts.push(lead.wants_area);
  if (lead.budget_max_pkr) parts.push(`up to ${formatPkr(lead.budget_max_pkr)}`);
  if (lead.buy_or_rent === 'rent') parts.push('(rent)');
  return parts.length > 0 ? parts.join(', ') : 'Requirement not specified';
}

const sampleLead = {
  wants_size: '5 marla',
  wants_area: 'DHA',
  budget_max_pkr: 25000000,
  buy_or_rent: 'buy',
};
assert.strictEqual(getRequirementSummary(sampleLead), '5 marla, DHA, up to 2.5 crore');
console.log('✓ Lead requirement summary formatting passed.');

console.log('\nAll core unit & domain tests passed successfully.');
