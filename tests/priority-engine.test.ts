import { describe, it, expect } from "vitest";
import { calculateIssuePriority } from "../lib/services/priority-engine";

describe("Priority Engine", () => {
  it("should categorize fire and life safety hazards as CRITICAL", () => {
    const result = calculateIssuePriority({
      title: "Electrical sparks and smoke from breaker box",
      description: "There is burning smell and visible sparks emerging from panel",
      categoryName: "Electrical",
    });
    expect(result.priority).toBe("CRITICAL");
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it("should categorize water leaks and pipe bursts as HIGH", () => {
    const result = calculateIssuePriority({
      title: "Water pipe leaking in dining hall",
      description: "Water is pooling across the kitchen floor continuously",
      categoryName: "Plumbing",
    });
    expect(result.priority).toBe("HIGH");
  });

  it("should categorize minor cosmetic issues as LOW", () => {
    const result = calculateIssuePriority({
      title: "Squeaky chair in lecture hall",
      description: "One chair has loose screw and squeaks when shifting weight",
      categoryName: "Furniture",
      defaultCategoryPriority: "LOW",
    });
    expect(result.priority).toBe("LOW");
  });

  it("should respect category default when no hazard keywords are present", () => {
    const result = calculateIssuePriority({
      title: "Routine classroom light maintenance",
      description: "Bulb replaced yesterday needs second check",
      categoryName: "Electrical",
      defaultCategoryPriority: "HIGH",
    });
    expect(result.priority).toBe("HIGH");
  });
});
