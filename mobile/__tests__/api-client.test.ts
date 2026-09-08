import { api, clearToken, getToken, saveToken } from "../src/api/client";

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) }) as Response;

const errResponse = (status: number, body: unknown) =>
  ({ ok: false, status, text: () => Promise.resolve(JSON.stringify(body)) }) as Response;

describe("api client", () => {
  const fetchMock = jest.fn();
  const original = global.fetch;

  beforeEach(async () => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    await clearToken();
  });

  afterAll(() => {
    global.fetch = original;
  });

  it("stores and clears the auth token", async () => {
    await saveToken("abc123");
    expect(await getToken()).toBe("abc123");
    await clearToken();
    expect(await getToken()).toBeNull();
  });

  it("attaches the bearer token when one is stored", async () => {
    await saveToken("tok");
    fetchMock.mockResolvedValueOnce(okResponse({ ok: true }));
    await api("/api/mobile/me");
    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers.Authorization).toBe("Bearer tok");
  });

  it("omits the bearer header when signed out", async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ ok: true }));
    await api("/api/mobile/me");
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  it("surfaces the server error message", async () => {
    fetchMock.mockResolvedValueOnce(errResponse(403, { error: "Join this group before commenting." }));
    await expect(api("/api/mobile/events/1/comments", { method: "POST" })).rejects.toThrow(
      "Join this group before commenting."
    );
  });

  it("joins validation details into the error", async () => {
    fetchMock.mockResolvedValueOnce(errResponse(400, { details: ["Email invalid", "Name too short"] }));
    await expect(api("/x")).rejects.toThrow("Email invalid\nName too short");
  });

  it("wraps a network failure with a helpful message", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Network request failed"));
    await expect(api("/x")).rejects.toThrow(/Cannot reach backend/);
  });
});
