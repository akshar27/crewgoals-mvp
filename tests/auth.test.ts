import { describe, expect, it } from "vitest";
import { canAccessAdmin } from "@/lib/auth";

describe("admin authorization helper", () => {
  it("allows admins only", () => {
    expect(canAccessAdmin("ADMIN")).toBe(true);
    expect(canAccessAdmin("USER")).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
  });
});
