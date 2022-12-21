[![GitHub release](https://img.shields.io/github/release/crazy-max/ghaction-github-release.svg?style=flat-square)](https://github.com/crazy-max/ghaction-github-release/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-github--release--action-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/github-release-action)
[![Test workflow](https://img.shields.io/github/actions/workflow/status/crazy-max/ghaction-github-release/test.yml?branch=master&label=test&logo=github&style=flat-square)](https://github.com/crazy-max/ghaction-github-release/actions?workflow=test)
[![Codecov](https://img.shields.io/codecov/c/github/crazy-max/ghaction-github-release?logo=codecov&style=flat-square)](https://codecov.io/gh/crazy-max/ghaction-github-release)
[![Become a sponsor](https://img.shields.io/badge/sponsor-crazy--max-181717.svg?logo=github&style=flat-square)](https://github.com/sponsors/crazy-max)
[![Paypal Donate](https://img.shields.io/badge/donate-paypal-00457c.svg?logo=paypal&style=flat-square)](https://www.paypal.me/crazyws)

## About

GitHub Action for creating GitHub Releases.

This repository is a fork of https://github.com/softprops/action-gh-release

___

* [Usage](#usage)
  * [Limit releases to pushes to tags](#limit-releases-to-pushes-to-tags)
  * [Uploading release assets](#uploading-release-assets)
  * [External release notes](#external-release-notes)
* [Customizing](#customizing)
  * [inputs](#inputs)
  * [outputs](#outputs)
  * [environment variables](#environment-variables)
* [Permissions](#permissions) 
* [Contributing](#contributing)
* [License](#license)

## Usage

### Limit releases to pushes to tags

Typically, usage of this action involves adding a step to a build that is gated
pushes to git tags. You may find `step.if` field helpful in accomplishing this
as it maximizes the reuse value of your workflow for non-tag pushes.

```yaml
name: release

on:
  push:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Release
        uses: crazy-max/ghaction-github-release@v1
        if: startsWith(github.ref, 'refs/tags/')
```

You can also use push config tag filter:

```yaml
name: release

on:
  push:
    tags:
      - "v*.*.*"

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Release
        uses: crazy-max/ghaction-github-release@v1
```

### Uploading release assets

You can configure a number of options for your GitHub release and all are
optional.

A common case for GitHub releases is to upload your binary after its been
validated and packaged. Use the `with.files` input to declare a
newline-delimited list of glob expressions matching the files you wish to
upload to GitHub releases. If you'd like you can just list the files by name
directly.

Below is an example of uploading a single asset named `release.txt`

```yaml
name: release

on:
  push:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Build
        run: echo ${{ github.sha }} > release.txt
      -
        name: Test
        run: cat Release.txt
      -
        name: Release
        uses: crazy-max/ghaction-github-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: release.txt
```

Below is an example of uploading more than one asset with a GitHub release:

```yaml
name: release

on:
  push:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Build
        run: echo ${{ github.sha }} > release.txt
      -
        name: Test
        run: cat Release.txt
      -
        name: Release
        uses: crazy-max/ghaction-github-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            release.txt
            LICENSE
```

> **Warning**
>
> Notice the `|` in the yaml syntax above. That lets you effectively declare a
> multi-line yaml string. You can learn more about multi-line yaml syntax [here](https://yaml-multiline.info)

### External release notes

Many systems exist that can help generate release notes for you. This action
supports loading release notes from a path in your repository's build to allow
for the flexibility of using any changelog generator for your releases,
including a human.

```yaml
name: release

on:
  push:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v3
      -
        name: Generate Changelog
        run: echo "# Good things have arrived" > ${{ github.workspace }}-CHANGELOG.txt
      -
        name: Release
        uses: crazy-max/ghaction-github-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          body_path: ${{ github.workspace }}-CHANGELOG.txt
          # note you'll typically need to create a personal access token
          # with permissions to create releases in the other repo
          token: ${{ secrets.CUSTOM_GITHUB_TOKEN }}
        env:
          GITHUB_REPOSITORY: my_gh_org/my_gh_repo
```

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name                       | Type    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|----------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `body`                     | String  | Text communicating notable changes in this release                                                                                                                                                                                                                                                                                                                                                                                              |
| `body_path`                | String  | Path to load text communicating notable changes in this release                                                                                                                                                                                                                                                                                                                                                                                 |
| `draft`                    | Boolean | Indicator of whether or not this release is a draft                                                                                                                                                                                                                                                                                                                                                                                             |
| `prerelease`               | Boolean | Indicator of whether or not is a prerelease                                                                                                                                                                                                                                                                                                                                                                                                     |
| `files`                    | String  | Newline-delimited globs of paths to assets to upload for release                                                                                                                                                                                                                                                                                                                                                                                |
| `name`                     | String  | Name of the release. defaults to tag name                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tag_name`                 | String  | Name of a tag. defaults to `github.ref`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `fail_on_unmatched_files`  | Boolean | Indicator of whether to fail if any of the `files` globs match nothing                                                                                                                                                                                                                                                                                                                                                                          |
| `repository`               | String  | Name of a target repository in `<owner>/<repo>` format. Defaults to GITHUB_REPOSITORY env variable                                                                                                                                                                                                                                                                                                                                              |
| `target_commitish`         | String  | Commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Defaults to repository default branch.                                                                                                                                                                                                                                                                                                      |
| `token`                    | String  | Secret GitHub Personal Access Token. Defaults to `${{ github.token }}`                                                                                                                                                                                                                                                                                                                                                                          |
| `discussion_category_name` | String  | If specified, a discussion of the specified category is created and linked to the release. The value must be a category that already exists in the repository. For more information, see ["Managing categories for discussions in your repository."](https://docs.github.com/en/discussions/managing-discussions-for-your-community/managing-categories-for-discussions-in-your-repository)                                                     |
| `generate_release_notes`   | Boolean | Whether to automatically generate the name and body for this release. If name is specified, the specified name will be used; otherwise, a name will be automatically generated. If body is specified, the body will be pre-pended to the automatically generated notes. See the [GitHub docs for this feature](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) for more information |
| `append_body`              | Boolean | Append to existing body instead of overwriting it                                                                                                                                                                                                                                                                                                                                                                                               |

> **Note**
>
> When providing a `body` and `body_path` at the same time, `body_path` will be
> attempted first, then falling back on `body` if the path can not be read from.

> **Note**
>
> When the release info keys (such as `name`, `body`, `draft`, `prerelease`, etc.)
> are not explicitly set and there is already an existing release for the tag,
> the release will retain its original info.

### outputs

Following outputs are available:

| Name         | Type   | Description                                                                                                                                                                               |
|--------------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`        | String | Github.com URL for the release                                                                                                                                                            |
| `id`         | String | Release ID                                                                                                                                                                                |
| `upload_url` | String | URL for uploading assets to the release                                                                                                                                                   |
| `assets`     | String | JSON array containing information about each uploaded asset, in the format given [here](https://docs.github.com/en/rest/releases/assets#get-a-release-asset) (minus the `uploader` field) |

### environment variables

Following environment variables can be used as `step.env` keys

| Name                | Description                                                                                                                                         |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `GITHUB_TOKEN`      | [GITHUB_TOKEN](https://help.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token) as provided by `secrets` |
| `GITHUB_REPOSITORY` | Name of a target repository in `<owner>/<repo>` format. defaults to the current repository                                                          |

## Permissions

This Action requires the following permissions on the GitHub integration token:

```yaml
permissions:
  contents: write
```

When used with `discussion_category_name`, additional permission is needed:

```yaml
permissions:
  contents: write
  discussions: write
```

[GitHub token permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
can be set for an individual job, workflow, or for Actions as a whole.

## Contributing

Want to contribute? Awesome! The most basic way to show your support is to star the project, or to raise issues. If
you want to open a pull request, please read the [contributing guidelines](.github/CONTRIBUTING.md).

## License

MIT. See `LICENSE` for more details.
