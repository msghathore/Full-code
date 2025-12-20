// Admin Authentication Utilities
// Uses Web Crypto API for secure password hashing (PBKDF2 with SHA-256)
// SECURITY: All credentials must be stored in environment variables

// SECURITY: Hash is computed at runtime from env variable, never stored in code
const ADMIN_SALT = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), '');

// Session timeout in milliseconds (5 minutes)
export const ADMIN_SESSION_TIMEOUT = 5 * 60 * 1000;

// Secure hash function using Web Crypto API
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password + salt);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify admin password
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('VITE_ADMIN_PASSWORD not set in environment');
    return false;
  }
  return password === adminPassword;
}

// Hash a password for storage (for staff passwords)
export async function hashStaffPassword(password: string): Promise<{ hash: string; salt: string }> {
  // Generate a random salt
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');

  const hash = await hashPassword(password, salt);
  return { hash, salt };
}

// Verify staff password
export async function verifyStaffPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

// Admin session management
interface AdminSession {
  isAuthenticated: boolean;
  lastActivity: number;
  loginTime: number;
}

const ADMIN_SESSION_KEY = 'admin_session';

export function getAdminSession(): AdminSession | null {
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;

    const session: AdminSession = JSON.parse(sessionData);

    // Check if session has expired (5 minutes of inactivity)
    if (Date.now() - session.lastActivity > ADMIN_SESSION_TIMEOUT) {
      clearAdminSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function setAdminSession(): void {
  const session: AdminSession = {
    isAuthenticated: true,
    lastActivity: Date.now(),
    loginTime: Date.now()
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function updateAdminActivity(): void {
  const session = getAdminSession();
  if (session) {
    session.lastActivity = Date.now();
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminAuthenticated(): boolean {
  const session = getAdminSession();
  return session?.isAuthenticated === true;
}

// Generate a secure temporary password for staff
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (let i = 0; i < 8; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}
