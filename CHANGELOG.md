# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-05-26
### Fixed
- The `model.dataKey` property actually works properly.
### Added
- The `model` class can now cache the results of getter functions using a new
  `DataProp.cache` property (default is `false`).
### Changed
- The default value of `DataProp.set` is now a placeholder value of `null`,
  which will be evaluated as `(DataProp.get === true)`.

## [1.0.0] - 2025-04-21
### Added
- Initial release.

[Unreleased]: https://github.com/supernovus/lum.simple-data.js/compare/v1.0.0...HEAD
[1.1.0]: https://github.com/supernovus/lum.simple-data.js/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/supernovus/lum.simple-data.js/releases/tag/v1.0.0

