'use strict';
// ═══════════════════════════════════════════
// CONFIG — supabase client + app constants
// ═══════════════════════════════════════════

const EDGE     = '__SUPABASE_URL__/functions/v1';
const ANON_KEY = '__SUPABASE_ANON_KEY__';
const SUPA_URL = '__SUPABASE_URL__';

const sb = window.supabase.createClient(SUPA_URL, ANON_KEY);

const PHONE_RE   = /^[0-9]{10}$/;
const REWARD_EXP = 90;

// Note: Supabase auth helpers (signInWithEmail, getCurrentUser, getMyProfile,
// signOutAuthUser) were removed as dead code. The app uses custom JWT-based
// auth via Edge Functions (nook-auth) rather than Supabase Auth, so these
// helpers were never called and their presence was creating architectural confusion.
