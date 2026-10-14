import { Lead } from './types';

/**
 * Format numbers into Pakistani units: Lakh and Crore
 * 1 Lakh = 100,000 PKR
 * 1 Crore = 10,000,000 PKR
 */
export function formatPkr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Price on request';
  }

  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    const crores = amount / 10000000;
    // e.g. 2.5 crore, 14.5 crore, 18 crore
    const formatted = parseFloat(crores.toFixed(2)).toString();
    return `${formatted} crore`;
  }

  if (abs >= 100000) {
    const lakhs = amount / 100000;
    // e.g. 85 lakh, 7.5 lakh
    const formatted = parseFloat(lakhs.toFixed(2)).toString();
    return `${formatted} lakh`;
  }

  return `${amount.toLocaleString('en-PK')} PKR`;
}

/**
 * Normalizes and formats Pakistani phone numbers to +92 XXX XXXXXXX
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  // strip all non-digits except leading +
  let digits = phone.replace(/[^\d]/g, '');

  // If starts with 03..., replace with 923...
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }

  // Format 923001234567 -> +92 300 1234567
  if (digits.startsWith('92') && digits.length === 12) {
    return `+92 ${digits.substring(2, 5)} ${digits.substring(5)}`;
  }

  // If already starts with +
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Generates direct wa.me link for WhatsApp
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.substring(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }
  const base = `https://wa.me/${digits}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

/**
 * Generates direct tel: link for calling
 */
export function getTelUrl(phone: string): string {
  const formatted = formatPhone(phone).replace(/\s+/g, '');
  return `tel:${formatted}`;
}

/**
 * Relative time helper for fast mobile scanning (e.g. "12m ago", "2h ago", "3d ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds) || diffInSeconds < 0) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Karachi',
  });
}

/**
 * Formats a timestamp in Asia/Karachi timezone
 */
export function formatKarachiDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Lead one-line requirement string (e.g. "5 marla, DHA, up to 2.5 crore")
 */
export function getRequirementSummary(lead: Lead): string {
  const parts: string[] = [];

  if (lead.wants_size) {
    parts.push(lead.wants_size);
  } else if (lead.wants_type) {
    parts.push(lead.wants_type);
  }

  if (lead.wants_area) {
    parts.push(lead.wants_area);
  }

  if (lead.budget_max_pkr) {
    parts.push(`up to ${formatPkr(lead.budget_max_pkr)}`);
  }

  if (lead.buy_or_rent === 'rent') {
    parts.push('(rent)');
  }

  return parts.length > 0 ? parts.join(', ') : 'Requirement not specified';
}
