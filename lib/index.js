'use strict';

const Joi = require('joi');
const { Writable } = require('readable-stream');
const {
    createCounter,
    createGauge,
    createHistogram,
    createSummary,
    isHistogram,
    isGauge,
} = require('./utils');
const {
    metricName,
    overrideConfig,
    constructorOptions,
} = require('../schemas');

const overrides = new Map();
const metricTypes = {
    HISTOGRAM: 'histogram',
    COUNTER: 'counter',
    GAUGE: 'gauge',
    SUMMARY: 'summary',
};

module.exports = class PrometheusMetricsConsumer extends Writable {
    constructor(options = {}) {
        super({ objectMode: true });
        this.options = Joi.attempt(
            options,
            constructorOptions,
            'Invalid `options` object given to new PrometheusMetricsConsumer.',
        );

        const { client } = this.options;
        this.Counter = client.Counter;
        this.Gauge = client.Gauge;
        this.Histogram = client.Histogram;
        this.Summary = client.Summary;
        this.bucketFunction = client.exponentialBuckets;
        this.registry = new client.Registry();
    }

    get [Symbol.toStringTag]() {
        return 'PrometheusMetricsConsumer';
    }

    labels(metric) {
        const labelNames = Object.keys(metric.meta || {});
        const labelValues = Object.values(metric.meta || {});

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
            .inc(1);
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

        if (metric.type && metric.type === 5) {
            // new metric object with type
            this.registry
                .getSingleMetric(name)
                .labels(...labelValues)
                .observe(metric.value);
        } else {
            // old metric object without type
            this.registry
                .getSingleMetric(name)
                .labels(...labelValues)
                .observe(time);
        }
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

        if (metric.type && metric.type === 7) {
            // new metric object with type
            this.registry
                .getSingleMetric(name)
                .labels(...labelValues)
                .observe(metric.value);
        } else {
            // old metric object without type
            this.registry
                .getSingleMetric(name)
                .labels(...labelValues)
                .observe(time);
        }
    }

    override(name, config) {
        overrides.set(
            Joi.attempt(
                name,
                metricName,
                'Invalid `name` given to prometheusMetricsConsumer.override.',
            ),
            Joi.attempt(
                config,
                overrideConfig,
                'Invalid `config` object given to prometheusMetricsConsumer.override.',
            ),
        );
    }

    typeFor(metric) {
        if (overrides.has(metric.name) && overrides.get(metric.name).type) {
            return overrides.get(metric.name).type;
        }

        if (isHistogram(metric)) {
            return metricTypes.HISTOGRAM;
        }

        if (isGauge(metric)) {
            return metricTypes.GAUGE;
        }

        return metricTypes.COUNTER;
    }

    _write(metric, enc, cb) {
        if (this.typeFor(metric) === metricTypes.HISTOGRAM) {
            if (!isHistogram(metric)) {
                cb(
                    new Error(
                        `Attempted to plot metric "${
                            metric.name
                        }" on a histogram, however metric was missing \`time\` value`,
                    ),
                );
                return;
            }
            this.histogram(metric);
        } else if (this.typeFor(metric) === metricTypes.GAUGE) {
            this.gauge(metric);
        } else if (this.typeFor(metric) === metricTypes.SUMMARY) {
            this.summary(metric);
        } else {
            this.counter(metric);
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
