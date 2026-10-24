// CampusConnect demo logic. All data is fictional demo data — no real student records.
// Authentication, eligibility and facility access are three SEPARATE checks.

export type Student = {
  username: string;
  password: string;
  name: string;
  studentId: string;
  enrolled: boolean;
  hold: string | null;
  facilityAccess: string[];
  note: string;
};

export const DEMO_STUDENTS: Student[] = [
  { username: "alex.demo", password: "demo123", name: "Alex Rivera", studentId: "DEMO-1001", enrolled: true, hold: null, facilityAccess: ["LIB", "GYM", "LAB"], note: "Eligible · access to all facilities" },
  { username: "sam.demo", password: "demo123", name: "Sam Chen", studentId: "DEMO-1002", enrolled: true, hold: null, facilityAccess: ["LIB"], note: "Eligible · Library only" },
  { username: "jordan.demo", password: "demo123", name: "Jordan Lee", studentId: "DEMO-1003", enrolled: true, hold: "Financial hold: unpaid tuition balance. Contact the Bursar's Office.", facilityAccess: ["LIB", "GYM"], note: "Has a financial hold" },
  { username: "taylor.demo", password: "demo123", name: "Taylor Brooks", studentId: "DEMO-1004", enrolled: false, hold: null, facilityAccess: ["LIB"], note: "Not enrolled this term" },
];

export type Facility = { code: string; name: string; qr: string };
export const FACILITIES: Facility[] = [
  { code: "LIB", name: "Main Library", qr: "CAMPUSCONNECT:LIB" },
  { code: "GYM", name: "Recreation Center", qr: "CAMPUSCONNECT:GYM" },
  { code: "LAB", name: "Engineering Lab", qr: "CAMPUSCONNECT:LAB" },
];

export type Result = { ok: true } | { ok: false; reason: string };

/** Check 1: credentials only. */
export function authenticate(username: string, password: string): { ok: true; student: Student } | { ok: false; reason: string } {
  if (!username.trim() || !password) return { ok: false, reason: "Please enter both your username and password." };
  const s = DEMO_STUDENTS.find((x) => x.username === username.trim().toLowerCase());
  if (!s || s.password !== password) return { ok: false, reason: "Incorrect username or password. Please try again." };
  return { ok: true, student: s };
}

/** Check 2: is this authenticated student allowed to use campus resources at all? */
export function checkEligibility(s: Student): Result {
  if (!s.enrolled) return { ok: false, reason: "You are not enrolled for the current term. Please contact the Registrar's Office." };
  if (s.hold) return { ok: false, reason: s.hold };
  return { ok: true };
}

export function findStudent(username: string | null | undefined) {
  return DEMO_STUDENTS.find((x) => x.username === username) ?? null;
}

export function parseFacilityQr(payload: string): Facility | null {
  return FACILITIES.find((f) => f.qr === payload.trim()) ?? null;
}

/** Check 3: full check-in decision. A scanned QR alone never grants access. */
export function checkFacilityAccess(sessionUsername: string | null, qrPayload: string): { ok: boolean; reason?: string; facility?: Facility } {
  const student = findStudent(sessionUsername);
  if (!student) return { ok: false, reason: "You are not signed in. Please sign in again." };
  const elig = checkEligibility(student);
  if (!elig.ok) return elig;
  const facility = parseFacilityQr(qrPayload);
  if (!facility) return { ok: false, reason: "This QR code is not a recognized CampusConnect facility code." };
  if (!student.facilityAccess.includes(facility.code))
    return { ok: false, reason: `Your account does not have access to ${facility.name}.`, facility };
  return { ok: true, facility };
}
