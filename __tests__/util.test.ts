import { describe, expect, it } from "@jest/globals";
import {
  releaseBody,
  isTag,
  paths,
  parseConfig,
  parseInputFiles,
  unmatchedPatterns,
  uploadUrl,
} from "../src/util";

describe("util", () => {
  describe("uploadUrl", () => {
    it("strips template", () => {
      expect(
        uploadUrl(
          "https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}"
        )
      ).toEqual(
        "https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets"
      );
    });
  });

  describe("parseInputFiles", () => {
    it("parses empty strings", () => {
      expect(parseInputFiles("")).toStrictEqual([]);
    });
    it("parses comma-delimited strings", () => {
      expect(parseInputFiles("foo,bar")).toStrictEqual(["foo", "bar"]);
    });
    it("parses newline and comma-delimited (and then some)", () => {
      expect(parseInputFiles("foo,bar\nbaz,boom,\n\ndoom,loom ")).toStrictEqual(
        ["foo", "bar", "baz", "boom", "doom", "loom"]
      );
    });
  });

  describe("releaseBody", () => {
    it("uses input body", () => {
      expect(
        releaseBody({
          github_ref: "",
          github_repository: "",
          github_token: "",
          input_body: "foo",
          input_body_path: undefined,
          input_draft: false,
          input_prerelease: false,
          input_files: [],
          input_name: undefined,
          input_tag_name: undefined,
          input_target_commitish: undefined,
          input_discussion_category_name: undefined,
          input_generate_release_notes: false,
        })
      ).toEqual("foo");
    });
    it("uses input body path", () => {
      expect(
        releaseBody({
          github_ref: "",
          github_repository: "",
          github_token: "",
          input_body: undefined,
          input_body_path: "__tests__/fixtures/release.txt",
          input_draft: false,
          input_prerelease: false,
          input_files: [],
          input_name: undefined,
          input_tag_name: undefined,
          input_target_commitish: undefined,
          input_discussion_category_name: undefined,
          input_generate_release_notes: false,
        })
      ).toEqual("bar");
    });
    it("defaults to body path when both body and body path are provided", () => {
      expect(
        releaseBody({
          github_ref: "",
          github_repository: "",
          github_token: "",
          input_body: "foo",
          input_body_path: "__tests__/fixtures/release.txt",
          input_draft: false,
          input_prerelease: false,
          input_files: [],
          input_name: undefined,
          input_tag_name: undefined,
          input_target_commitish: undefined,
          input_discussion_category_name: undefined,
          input_generate_release_notes: false,
        })
      ).toEqual("bar");
    });
  });
  describe("parseConfig", () => {
    it("parses basic config", () => {
      expect(
        parseConfig({
          // note: inputs declared in actions.yml, even when declared not required,
          // are still provided by the actions runtime env as empty strings instead of
          // the normal absent env value one would expect. this breaks things
          // as an empty string !== undefined in terms of what we pass to the api
          // so we cover that in a test case here to ensure undefined values are actually
          // resolved as undefined and not empty strings
          INPUT_TARGET_COMMITISH: "",
          INPUT_DISCUSSION_CATEGORY_NAME: "",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: undefined,
        input_prerelease: undefined,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
    it("parses basic config with commitish", () => {
      expect(
        parseConfig({
          INPUT_TARGET_COMMITISH: "affa18ef97bc9db20076945705aba8c516139abd",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: undefined,
        input_prerelease: undefined,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: "affa18ef97bc9db20076945705aba8c516139abd",
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
    it("supports discussion category names", () => {
      expect(
        parseConfig({
          INPUT_DISCUSSION_CATEGORY_NAME: "releases",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: undefined,
        input_prerelease: undefined,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: "releases",
        input_generate_release_notes: false,
      });
    });
    it("supports generating release notes", () => {
      expect(
        parseConfig({
          INPUT_GENERATE_RELEASE_NOTES: "true",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: undefined,
        input_prerelease: undefined,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: true,
      });
    });

    it("prefers GITHUB_TOKEN over token input for backwards compatibility", () => {
      expect(
        parseConfig({
          INPUT_DRAFT: "false",
          INPUT_PRERELEASE: "true",
          GITHUB_TOKEN: "env-token",
          INPUT_TOKEN: "input-token",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "env-token",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: false,
        input_prerelease: true,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
    it("uses input token as the source of GITHUB_TOKEN by default", () => {
      expect(
        parseConfig({
          INPUT_DRAFT: "false",
          INPUT_PRERELEASE: "true",
          INPUT_TOKEN: "input-token",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "input-token",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: false,
        input_prerelease: true,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
    it("parses basic config with draft and prerelease", () => {
      expect(
        parseConfig({
          INPUT_DRAFT: "false",
          INPUT_PRERELEASE: "true",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: false,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: false,
        input_prerelease: true,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
    it("parses basic config with append_body", () => {
      expect(
        parseConfig({
          INPUT_APPEND_BODY: "true",
        })
      ).toStrictEqual({
        github_ref: "",
        github_repository: "",
        github_token: "",
        input_append_body: true,
        input_body: undefined,
        input_body_path: undefined,
        input_draft: undefined,
        input_prerelease: undefined,
        input_files: [],
        input_name: undefined,
        input_tag_name: undefined,
        input_fail_on_unmatched_files: false,
        input_target_commitish: undefined,
        input_discussion_category_name: undefined,
        input_generate_release_notes: false,
      });
    });
  });

  describe("isTag", () => {
    it("returns true for tags", async () => {
      expect(isTag("refs/tags/foo")).toEqual(true);
    });
    it("returns false for other kinds of refs", async () => {
      expect(isTag("refs/heads/master")).toEqual(false);
    });
  });

  describe("paths", () => {
    it("resolves files given a set of paths", async () => {
      expect(
        paths([
          "__tests__/fixtures/data/**/*",
          "__tests__/fixtures/data/does/not/exist/*",
        ])
      ).toStrictEqual(["__tests__/fixtures/data/foo/bar.txt"]);
    });
  });

  describe("unmatchedPatterns", () => {
    it("returns the patterns that don't match any files", async () => {
      expect(
        unmatchedPatterns([
          "__tests__/fixtures/data/**/*",
          "__tests__/fixtures/data/does/not/exist/*",
        ])
      ).toStrictEqual(["__tests__/fixtures/data/does/not/exist/*"]);
    });
  });
});
