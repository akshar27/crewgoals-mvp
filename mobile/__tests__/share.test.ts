import { Share } from "react-native";
import { shareApp, shareEvent, shareGroup } from "../src/share";

jest.mock("react-native", () => ({ Share: { share: jest.fn() } }));

const shareSpy = Share.share as jest.Mock;

describe("share helpers", () => {
  const OLD = process.env.EXPO_PUBLIC_API_URL;
  beforeEach(() => {
    shareSpy.mockReset();
    process.env.EXPO_PUBLIC_API_URL = "https://crew.example";
  });
  afterAll(() => {
    process.env.EXPO_PUBLIC_API_URL = OLD;
  });

  it("shareGroup includes the group name, location, and a /groups link", () => {
    shareGroup({ id: "g1", title: "Gym Crew", neighborhood: "SoMa", city: "SF", goal: { name: "gym consistency" } });
    const { message } = shareSpy.mock.calls[0][0];
    expect(message).toContain("Gym Crew");
    expect(message).toContain("SoMa, SF");
    expect(message).toContain("gym consistency crew");
    expect(message).toContain("https://crew.example/groups/g1");
  });

  it("shareEvent links to /events and names the group", () => {
    shareEvent({ id: "e9", title: "Saturday 5K", group: { title: "Run Crew" } });
    const { message } = shareSpy.mock.calls[0][0];
    expect(message).toContain("Saturday 5K");
    expect(message).toContain("with Run Crew");
    expect(message).toContain("https://crew.example/events/e9");
  });

  it("shareApp links to the site root", () => {
    shareApp();
    expect(shareSpy.mock.calls[0][0].message).toContain("https://crew.example/");
  });
});
