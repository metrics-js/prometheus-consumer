'use strict';

const abslog = require('abslog');
const { Writable } = require('readable-stream');
const {
    createCounter,
    createGauge,
    createHistogram,
    createSummary,
    isHistogram,
    isSummary,
    isGauge,
} = require('./utils');
const is = require('./is');

const overrides = new Map();
const metricTypes = {
    HISTOGRAM: 'histogram',
    COUNTER: 'counter',
    GAUGE: 'gauge',
    SUMMARY: 'summary',
};

function deprecateMetaForLabels() {
    if (!deprecateMetaForLabels.warned) {
        deprecateMetaForLabels.warned = true;
        process.emitWarning(
            `
Using metric meta property for labels (eg. metric({ meta: { label: "value" } })) is now deprecated and will be removed in a future version.
Please use the "labels" key instead.
See https://github.com/metrics-js/client for up to date usage.
            `,
            'DeprecationWarning',
        );
    }
}

module.exports = class PrometheusMetricsConsumer extends Writable {
    constructor({
        bucketStepFactor = 1.15,
        bucketStepCount = 45,
        bucketStepStart = 0.001,
        logger,
        client,
    } = {}) {
        super({ objectMode: true });

        // Required arguments
        if (!client) throw new Error('The argument "client" must be provided');

        // Validation
        if (!is.validPromClient(client))
            throw new Error(
                'Provided value to argument "client" is not a Prometheus client',
            );
        if (!is.validBucketStepFactor(bucketStepFactor))
            throw new Error(
                'Provided value to argument "bucketStepFactor" is not legal',
            );
        if (!is.validBucketStepCount(bucketStepCount))
            throw new Error(
                'Provided value to argument "bucketStepCount" is not legal',
            );
        if (!is.validBucketStepStart(bucketStepStart))
            throw new Error(
                'Provided value to argument "bucketStepStart" is not legal',
            );

        this.options = {
            bucketStepFactor,
            bucketStepCount,
            bucketStepStart,
            logger,
            client,
        };

        this.Counter = client.Counter;
        this.Gauge = client.Gauge;
        this.Histogram = client.Histogram;
        this.Summary = client.Summary;
        this.bucketFunction = client.exponentialBuckets;
        this.registry = new client.Registry();
        this.logger = abslog(logger);
    }

    get [Symbol.toStringTag]() {
        return 'PrometheusMetricsConsumer';
    }

    labels(metric) {
        const labelNames = [];
        const labelValues = [];

        if (Array.isArray(metric.labels) && metric.labels.length) {
            metric.labels.forEach(label => {
                labelNames.push(label.name);
                labelValues.push(label.value);
            });
        } else if (Object.keys(metric.meta || {}).length) {
            // legacy
            Object.keys(metric.meta || {}).forEach(key => {
                // hack to ensure new legit meta are not treated as labels
                // during backwards compatibility handling
                if (key === 'buckets') return;
                if (key === 'quantiles') return;

                deprecateMetaForLabels();

                labelNames.push(key);
                labelValues.push(metric.meta[key]);
            });
        }

        return { labelNames, labelValues };
    }

    bucketsForHistogram(name) {
        return overrides.has(name) ? overrides.get(name).buckets : {};
    }

    counter(metric) {
        const { name } = metric;
        const { labelNames, labelValues } = this.labels(metric);

        if (!this.registry.getSingleMetric(name)) {
            createCounter(this.Counter, metric, {
                labels: labelNames,
                registry: this.registry,
            });
        }

        this.registry
            .getSingleMetric(name)
            .labels(...labelValues)
            .inc(metric.value || 1);
    }

    gauge(metric) {
        const { name } = metric;
        const { labelNames, labelValues } = this.labels(metric);

        if (!this.registry.getSingleMetric(name)) {
            createGauge(this.Gauge, metric, {
                labels: labelNames,
                registry: this.registry,
            });
        }

        this.registry
            .getSingleMetric(name)
            .labels(...labelValues)
            .set(metric.value);
    }

    histogram(metric) {
        const { name, time } = metric;
        const { labelNames, labelValues } = this.labels(metric);

        if (!this.registry.getSingleMetric(name)) {
            createHistogram(this.Histogram, this.bucketFunction, metric, {
                ...this.options,
                ...this.bucketsForHistogram(name),
                labels: labelNames,
                registry: this.registry,
            });
        }

        // fallback to "time" for backwards compat.
        const value = metric.type ? metric.value : time;

        this.registry
            .getSingleMetric(name)
            .labels(...labelValues)
            .observe(value);
    }

    summary(metric) {
        const { name, time } = metric;
        const { labelNames, labelValues } = this.labels(metric);

        if (!this.registry.getSingleMetric(name)) {
            createSummary(this.Summary, metric, {
                labels: labelNames,
                registry: this.registry,
            });
        }

        // fallback to "time" for backwards compat.
        const value = metric.type ? metric.value : time;

        this.registry
            .getSingleMetric(name)
            .labels(...labelValues)
            .observe(value);
    }

    override(name = '', config = {}) {
        if (!is.validName(name))
            throw new Error(
                'Invalid "name" given to prometheusMetricsConsumer.override. "name" must only contain alpha-numeric and underscore characters',
            );

        const bucket = config.bucket || {};

        if (!is.validBucketStepFactor(bucket.bucketStepFactor))
            throw new Error(
                'Provided value to argument "config.bucket.bucketStepFactor" is not legal',
            );
        if (!is.validBucketStepCount(bucket.bucketStepCount))
            throw new Error(
                'Provided value to argument "config.bucket.bucketStepCount" is not legal',
            );
        if (!is.validBucketStepStart(bucket.bucketStepStart))
            throw new Error(
                'Provided value to argument "config.bucket.bucketStepStart" is not legal',
            );
        if (!is.validType(config.type))
            throw new Error(
                'Invalid "config" object given to prometheusMetricsConsumer.override. "type" must be one of "counter", "histogram", "gauge", "summary"',
            );

        overrides.set(name, config);
    }

    typeFor(metric) {
        if (overrides.has(metric.name) && overrides.get(metric.name).type) {
            return overrides.get(metric.name).type;
        }

        if (isHistogram(metric)) {
            return metricTypes.HISTOGRAM;
        }

        if (isSummary(metric)) {
            return metricTypes.SUMMARY;
        }

        if (isGauge(metric)) {
            return metricTypes.GAUGE;
        }

        return metricTypes.COUNTER;
    }

    // eslint-disable-next-line no-underscore-dangle
    _write(metric, enc, cb) {
        if (this.typeFor(metric) === metricTypes.HISTOGRAM) {
            try {
                this.histogram(metric);
            } catch (err) {
                this.logger.error(
                    `failed to generate prometheus histogram for metric "${JSON.stringify(
                        metric,
                    )}"`,
                    err,
                );
            }
        } else if (this.typeFor(metric) === metricTypes.GAUGE) {
            try {
                this.gauge(metric);
            } catch (err) {
                this.logger.error(
                    `failed to generate prometheus gauge for metric "${JSON.stringify(
                        metric,
                    )}"`,
                    err,
                );
            }
        } else if (this.typeFor(metric) === metricTypes.SUMMARY) {
            try {
                this.summary(metric);
            } catch (err) {
                this.logger.error(
                    `failed to generate prometheus summary metric for "${JSON.stringify(
                        metric,
                    )}"`,
                    err,
                );
            }
        } else {
            try {
                this.counter(metric);
            } catch (err) {
                this.logger.error(
                    `failed to generate prometheus counter for metric "${JSON.stringify(
                        metric,
                    )}"`,
                    err,
                );
            }
        }
        cb();
    }

    metrics() {
        return this.registry.metrics();
    }

    contentType() {
        return this.registry.contentType;
    }
};
