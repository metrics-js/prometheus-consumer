## [4.0.4](https://github.com/metrics-js/prometheus-consumer/compare/v4.0.3...v4.0.4) (2024-02-01)


### Bug Fixes

* ensures errors are logged with the error ([4840ca5](https://github.com/metrics-js/prometheus-consumer/commit/4840ca58a779c76995c972caac446749e04deb59))

## [4.0.3](https://github.com/metrics-js/prometheus-consumer/compare/v4.0.2...v4.0.3) (2023-11-08)


### Bug Fixes

* add registry field to types and fix client from any ([0e245a6](https://github.com/metrics-js/prometheus-consumer/commit/0e245a6b1293f2d2d7a2eda2dccdd654c29d3f64))

# Changelog

Notable changes to this project will be documented in this file.

The latest version of this document is always available in [releases][releases-url].

## [4.0.2] - 2023-09-19

-   Fixing type information [#76](https://github.com/metrics-js/prometheus-consumer/pull/76)

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

[4.0.2]: https://github.com/metrics-js/prometheus-consumer/compare/v3.0.0...v4.0.2
[3.0.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.2.0...v3.0.0
[2.2.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.3...v2.2.0
[2.1.3]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/metrics-js/prometheus-consumer/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.2...v2.1.0
[2.0.2]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/metrics-js/prometheus-consumer/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/metrics-js/prometheus-consumer/compare/v1.0.0...v2.0.0
[releases-url]: https://github.com/metrics-js/prometheus-consumer/blob/main/CHANGELOG.md
