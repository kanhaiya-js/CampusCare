import { describe, it, expect } from "vitest";
import { isValidStatusTransition, generatePublicIssueId } from "../lib/utils/format";

describe("Format & State Machine Utilities", () => {
  it("should generate public issue IDs with current year and padded sequence", () => {
    const year = new Date().getFullYear();
    const id = generatePublicIssueId(41);
    expect(id).toBe(`SC-${year}-000042`);
  });

  it("should allow staff to transition from ASSIGNED to IN_PROGRESS and then RESOLVED", () => {
    expect(isValidStatusTransition("ASSIGNED", "IN_PROGRESS", "STAFF")).toBe(true);
    expect(isValidStatusTransition("IN_PROGRESS", "RESOLVED", "STAFF")).toBe(true);
  });

  it("should prevent staff from directly marking SUBMITTED as RESOLVED", () => {
    expect(isValidStatusTransition("SUBMITTED", "RESOLVED", "STAFF")).toBe(false);
  });

  it("should allow user to transition RESOLVED to CLOSED or REOPENED", () => {
    expect(isValidStatusTransition("RESOLVED", "CLOSED", "USER")).toBe(true);
    expect(isValidStatusTransition("RESOLVED", "REOPENED", "USER")).toBe(true);
  });

  it("should forbid user from directly closing an IN_PROGRESS ticket", () => {
    expect(isValidStatusTransition("IN_PROGRESS", "CLOSED", "USER")).toBe(false);
  });

  it("should forbid reopening a CLOSED issue directly to IN_PROGRESS without admin reopening", () => {
    expect(isValidStatusTransition("CLOSED", "IN_PROGRESS", "STAFF")).toBe(false);
    expect(isValidStatusTransition("CLOSED", "IN_PROGRESS", "ADMIN")).toBe(false);
  });

  it("should support GLBITM roles and extended lifecycle states", () => {
    expect(isValidStatusTransition("RESOLVED", "USER_CONFIRMED", "STUDENT")).toBe(true);
    expect(isValidStatusTransition("ASSIGNED", "ON_HOLD", "MAINTENANCE_STAFF")).toBe(true);
    expect(isValidStatusTransition("ON_HOLD", "IN_PROGRESS", "MAINTENANCE_STAFF")).toBe(true);
    expect(isValidStatusTransition("SUBMITTED", "VERIFIED", "DEPARTMENT_COORDINATOR")).toBe(true);
  });
});
