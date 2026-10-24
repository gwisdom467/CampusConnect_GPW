import { describe, it, expect } from "vitest";
import { authenticate, checkEligibility, checkFacilityAccess, findStudent } from "@/lib/campus";

describe("campus checks", () => {
  it("rejects wrong password", () => expect(authenticate("alex.demo", "x").ok).toBe(false));
  it("accepts demo credentials", () => expect(authenticate("alex.demo", "demo123").ok).toBe(true));
  it("student with hold is ineligible", () => expect(checkEligibility(findStudent("jordan.demo")!).ok).toBe(false));
  it("unenrolled student is ineligible", () => expect(checkEligibility(findStudent("taylor.demo")!).ok).toBe(false));
  it("valid QR without sign-in is denied", () => expect(checkFacilityAccess(null, "CAMPUSCONNECT:LIB").ok).toBe(false));
  it("held student denied even with valid QR", () => expect(checkFacilityAccess("jordan.demo", "CAMPUSCONNECT:LIB").ok).toBe(false));
  it("student without facility permission denied", () => expect(checkFacilityAccess("sam.demo", "CAMPUSCONNECT:GYM").ok).toBe(false));
  it("eligible student with permission approved", () => expect(checkFacilityAccess("alex.demo", "CAMPUSCONNECT:GYM").ok).toBe(true));
  it("unknown QR denied", () => expect(checkFacilityAccess("alex.demo", "hello").ok).toBe(false));
});
