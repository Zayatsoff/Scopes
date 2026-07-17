import { resolveCollectionName } from "./firestore-repo";

describe("resolveCollectionName", () => {
  it("returns the unsuffixed name when env is production", () => {
    expect(resolveCollectionName("news", "production")).toBe("news");
  });

  it("appends _dev when env is dev", () => {
    expect(resolveCollectionName("news", "dev")).toBe("news_dev");
  });

  it("appends _dev when env is unset", () => {
    expect(resolveCollectionName("news", undefined)).toBe("news_dev");
  });

  it("appends _dev for any value other than the literal 'production'", () => {
    expect(resolveCollectionName("news", "Production")).toBe("news_dev");
    expect(resolveCollectionName("news", "prod")).toBe("news_dev");
  });
});
