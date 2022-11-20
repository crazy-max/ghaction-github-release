import "node-fetch";
import { describe, expect, it, jest } from "@jest/globals";
import { mimeOrDefault, asset } from "../src/github";

jest.mock("node-fetch", () => jest.fn());

describe("github", () => {
  describe("mimeOrDefault", () => {
    it("returns a specific mime for common path", async () => {
      expect(mimeOrDefault("foo.tar.gz")).toEqual("application/gzip");
    });
    it("returns default mime for uncommon path", async () => {
      expect(mimeOrDefault("foo.uncommon")).toEqual("application/octet-stream");
    });
  });

  describe("asset", () => {
    it("derives asset info from a path", async () => {
      const { name, mime, size, data } = asset(
        "__tests__/fixtures/data/foo/bar.txt"
      );
      expect(name).toEqual("bar.txt");
      expect(mime).toEqual("text/plain");
      expect(size).toEqual(10);
      expect(data.toString()).toEqual("release me");
    });
  });
});
