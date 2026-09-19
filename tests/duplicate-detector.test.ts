import { describe, it, expect } from "vitest";
import { evaluateSimilarity, tokenizeText, calculateJaccardSimilarity } from "../lib/services/duplicate-detector";

describe("Duplicate Detector", () => {
  it("should tokenize and filter common stop words", () => {
    const tokens = tokenizeText("The AC is not working in the room");
    expect(tokens.has("the")).toBe(false);
    expect(tokens.has("working")).toBe(true);
  });

  it("should calculate correct Jaccard token similarity", () => {
    const setA = new Set(["air", "conditioner", "broken"]);
    const setB = new Set(["air", "conditioner", "cooling"]);
    const sim = calculateJaccardSimilarity(setA, setB);
    expect(sim).toBe(2 / 4); // 0.5
  });

  it("should detect duplicate issues in same room and category", () => {
    const match = evaluateSimilarity(
      {
        title: "AC not cooling in Room A-204",
        description: "The air conditioner is only blowing warm ambient air",
        categoryId: "cat-hvac",
        locationId: "loc-block-a",
        room: "A-204",
      },
      {
        id: "issue-1",
        publicIssueId: "SC-2026-000101",
        title: "AC not cooling and making loud vibrations",
        description: "The central wall AC unit in Room A-204 fails to blow cold air",
        categoryId: "cat-hvac",
        categoryName: "HVAC & Air Conditioning",
        locationId: "loc-block-a",
        locationName: "Engineering Block A",
        room: "A-204",
        status: "IN_PROGRESS",
        createdAt: new Date(),
      }
    );

    expect(match).not.toBeNull();
    expect(match?.similarityScore).toBeGreaterThanOrEqual(0.6);
    expect(match?.explanation.length).toBeGreaterThan(0);
  });

  it("should not flag issues in different locations with completely different problems", () => {
    const match = evaluateSimilarity(
      {
        title: "Wi-Fi router dead in library",
        description: "Students cannot connect to Eduroam network in 3rd floor quiet zone",
        categoryId: "cat-network",
        locationId: "loc-library",
        room: "Quiet Zone",
      },
      {
        id: "issue-2",
        publicIssueId: "SC-2026-000102",
        title: "Leaking faucet in dining hall kitchen",
        description: "Water dripping constantly under sink",
        categoryId: "cat-plumbing",
        categoryName: "Plumbing",
        locationId: "loc-cafeteria",
        locationName: "Student Center Cafeteria",
        room: "Kitchen",
        status: "SUBMITTED",
        createdAt: new Date(),
      }
    );

    expect(match).toBeNull();
  });
});
