# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).


## [v1.4.2] - 2026-02-24

### Fixed

- Security vulnerabilities on dependencies ([#47](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/47)) ([#48](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/48)).

## [v1.4.1] - 2025-10-10

### Fixed

- Security vulnerability on dependencies ([#45](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/45)) ([#46](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/46)).
- 2D Graph: label text positioning when zooming in / out ([#45](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/45)).

### Changed

- 3D Graph: replaced gradient shader material with vertex colors one ([#45](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/45)).
- 2D Graph: moved link arrow position to the middle and increased size ([#45](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/45)).

### Removed

- Dependency on Splunk node.js to support Splunk 10.0 ([#45](https://github.com/splunk/splunk-3D-graph-network-topology-viz/pull/45)).

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
