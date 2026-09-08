import { defaultPreference, normalizePreference, validateProfile } from "../src/preference";

describe("normalizePreference", () => {
  it("fills gaps from defaults and keeps provided values", () => {
    const out = normalizePreference({ name: "Sam", city: "Oakland", goals: [] });
    expect(out.name).toBe("Sam");
    expect(out.city).toBe("Oakland");
    expect(out.goals.length).toBeGreaterThan(0); // empty array -> defaults
    expect(out.photoUrl).toBe("");
  });

  it("keeps a valid preferredGroupSize but replaces a non-integer", () => {
    expect(normalizePreference({ preferredGroupSize: 12 }).preferredGroupSize).toBe(12);
    expect(normalizePreference({ preferredGroupSize: undefined }).preferredGroupSize).toBe(
      defaultPreference("").preferredGroupSize
    );
  });
});

describe("validateProfile", () => {
  it("passes a fully-populated default profile", () => {
    expect(validateProfile(defaultPreference("Sam"))).toEqual([]);
  });

  it("flags every missing required field", () => {
    const broken = normalizePreference({ name: "" });
    broken.name = "";
    broken.city = "";
    broken.goals = [];
    broken.preferredGroupSize = 99;
    const errors = validateProfile(broken);
    expect(errors).toEqual(
      expect.arrayContaining([
        "Name is required.",
        "City is required.",
        "Choose at least one goal.",
        "Preferred group size must be between 3 and 20.",
      ])
    );
  });
});
