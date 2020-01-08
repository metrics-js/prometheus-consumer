# Changelog

Notable changes to this project will be documented in this file.

The latest version of this document is always available in [releases][releases-url].

## [Unreleased]

## [3.0.0] - 2020-01-09

-   Removed the usage of Joi.

## [2.2.0] - 2019-03-01

-   Adds support for passing in a logger
-   Guards against prom client errors and logs

## [2.1.3] - 2019-02-27

-   deprecates the use of the meta metric property for labels
-   adds backward compatibility patch to support labels set in meta object until the next breaking change

## [2.1.2] - 2019-02-27

-   fixes a bug where labels were not being properly processed when metrics stream items were created using the latest version of the `@metrics/metric` package.

## [2.1.1] - 2019-02-09

-   fix issue with backwards compatibility in summary and histogram

## [2.1.0] - 2019-02-08

-   update dependencies and fix test determinism
-   add test cases, fix counter increment
-   remove unnecessary error and test
-   use metric.type to determine type of metric

## [2.0.2] - 2019-02-08

-   immediately republished to 2.1.0

## [2.0.1] - 2019-02-07

-   Handle old and new metric object
-   Handle histogram
-   update dependencies
-   add Greenkeeper badge
-   fix doc link
-   move release notes to the root

## [2.0.0] - 2018-11-22

-   prom-client global state removed
-   .metrics() method added
-   .contentType() method added
-   lint fixing

[unreleased]: https://github.com/metrics-js/prometheus-consumer/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.2.0...v3.0.0
[2.2.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/metrics-js/prometheus-consumer/compare/v1.0.0...v2.0.0
[releases-url]: https://github.com/metrics-js/prometheus-consumer/blob/master/CHANGELOG.md
