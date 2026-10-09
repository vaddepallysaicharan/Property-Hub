/**
 * Client storage utility for tracking user's submitted enquiries
 * in the absence of a server-side session/auth system.
 */

const SENT_ENQUIRIES_KEY = 'propertyhub_sent_enquiries';
const USER_EMAIL_KEY = 'propertyhub_user_email';
const USER_NAME_KEY = 'propertyhub_user_name';
const USER_PHONE_KEY = 'propertyhub_user_phone';

export function getSentEnquiryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SENT_ENQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addSentEnquiryId(
  id: string,
  userDetails?: { name?: string; email?: string; phone?: string }
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSentEnquiryIds();
    if (!existing.includes(id)) {
      existing.unshift(id);
      localStorage.setItem(SENT_ENQUIRIES_KEY, JSON.stringify(existing));
    }
    if (userDetails?.email) {
      localStorage.setItem(USER_EMAIL_KEY, userDetails.email.trim().toLowerCase());
    }
    if (userDetails?.name) {
      localStorage.setItem(USER_NAME_KEY, userDetails.name.trim());
    }
    if (userDetails?.phone) {
      localStorage.setItem(USER_PHONE_KEY, userDetails.phone.trim());
    }
  } catch (e) {
    console.warn('Could not store sent enquiry to localStorage:', e);
  }
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(USER_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function getUserStoredDetails(): { name?: string; email?: string; phone?: string } {
  if (typeof window === 'undefined') return {};
  try {
    return {
      name: localStorage.getItem(USER_NAME_KEY) || undefined,
      email: localStorage.getItem(USER_EMAIL_KEY) || undefined,
      phone: localStorage.getItem(USER_PHONE_KEY) || undefined,
    };
  } catch {
    return {};
  }
}
