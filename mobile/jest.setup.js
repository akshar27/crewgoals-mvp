// expo-secure-store touches native modules; back it with an in-memory map for tests.
jest.mock("expo-secure-store", () => {
  const store = new Map();
  return {
    setItemAsync: jest.fn((key, value) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    getItemAsync: jest.fn((key) => Promise.resolve(store.get(key) ?? null)),
    deleteItemAsync: jest.fn((key) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
});
