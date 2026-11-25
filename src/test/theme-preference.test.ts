import { beforeEach, describe, expect, it } from "vitest";
import { getThemePreference, saveThemePreference } from "@/services/api";
beforeEach(() => localStorage.clear());
describe("Appearance preference", () => {
  it("defaults to device appearance", () => {
    expect(getThemePreference()).toBe("system");
  });
  it("remembers a light override", () => {
    saveThemePreference("light");
    expect(getThemePreference()).toBe("light");
  });
  it("remembers a dark override", () => {
    saveThemePreference("dark");
    expect(getThemePreference()).toBe("dark");
  });
  it("can return to device appearance", () => {
    saveThemePreference("dark");
    saveThemePreference("system");
    expect(getThemePreference()).toBe("system");
  });
});