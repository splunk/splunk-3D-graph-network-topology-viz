# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).


## [v1.4.0] - 2025-01-16

### Added

- Option to toggle nodes label ([#40](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/40)) as per feature request [#39](https://github.com/splunk/splunk-3D-graph-network-topology-viz/issues/39).

### Fixed

- [#32](https://github.com/splunk/splunk-3D-graph-network-topology-viz/issues/32): Use gradient colors to highlight nodes which are both sources and destinations ([#40](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/40)).
- Security vulnerabilites ([#40](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/40)).

### Changed

- Updated documentation to include drilldown feature availability ([#40](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/40)).

## [v1.3.2] - 2022-05-11

### Fixed

- Minors to comply with jquery vulnerabilities ([#27](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/27)).
- Patched `path-parse` security vulnerability ([#27](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/27)).

### Added

- Reload trigger for custom conf ([#27](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/27)).

## [v1.3.1] - 2021-12-07

### Fixed
- Security vulnerability on dependency.
- Minors for "Graph Analysis Framework" dashboard affecting Splunk 8.2 users.
