'use strict';

const { Readable } = require('readable-stream');
const promClient = require('prom-client');
const { test } = require('tap');
const Metric = require('@metrics/metric');

const PrometheusMetricsConsumer = require('../lib');

const src = (arr) =>
    new Readable({
        objectMode: true,
        read() {
            arr.forEach((el) => {
                this.push(el);
            });
            this.push(null);
        },
    });

test('.toString() returns correct object name', (t) => {
    const str = new PrometheusMetricsConsumer({
        client: promClient,
    }).toString();
    t.equal(str, '[object PrometheusMetricsConsumer]');
    t.end();
});

test('metrics interpreted as a counter', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'my_counter', description: '.' },
        { name: 'my_counter', description: '.' },
        { name: 'my_counter', description: '.' },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric('my_counter');
        t.matchSnapshot(result);
        t.end();
    });
});

test('metrics interpreted as a histogram', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'my_histogram', description: '.', time: 0.1 },
        { name: 'my_histogram', description: '.', time: 0.1 },
        { name: 'my_histogram', description: '.', time: 0.2 },
        { name: 'my_histogram', description: '.', time: 0.3 },
        { name: 'my_histogram', description: '.', time: 0.2 },
        { name: 'my_histogram', description: '.', time: 0.9 },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric('my_histogram');
        t.matchSnapshot(result);
        t.end();
    });
});

test('gauge metrics interpreted as counters', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'my_gauge', description: '.', value: 10 },
        { name: 'my_gauge', description: '.', value: 8 },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric('my_gauge');
        t.matchSnapshot(result);
        t.end();
    });
});

test('mixed metrics interpreted correctly', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'mixed_counter', description: '.', timestamp: 12324355 },
        {
            name: 'mixed_gauge',
            description: '.',
            value: 8,
            timestamp: 12324356,
        },
        {
            name: 'mixed_histogram',
            description: '.',
            time: 0.1,
            timestamp: 12324357,
        },
        { name: 'mixed_counter', description: '.', timestamp: 12324358 },
        {
            name: 'mixed_gauge',
            description: '.',
            value: 4,
            timestamp: 12324359,
        },
        {
            name: 'mixed_histogram',
            description: '.',
            time: 0.2,
            timestamp: 123243510,
        },
        { name: 'mixed_counter', description: '.', timestamp: 123243511 },
        {
            name: 'mixed_gauge',
            description: '.',
            value: 10,
            timestamp: 123243512,
        },
        {
            name: 'mixed_histogram',
            description: '.',
            time: 0.2,
            timestamp: 123243513,
        },
        {
            name: 'new_summary',
            description: '.',
            value: 0.2,
            timestamp: 123243513,
            type: 7,
        },
        {
            name: 'new_histogram',
            description: '.',
            value: 0.2,
            timestamp: 123243513,
            type: 5,
        },
        {
            name: 'new_gauge',
            description: '.',
            value: 0.2,
            timestamp: 123243513,
            type: 1,
        },
        {
            name: 'new_counter',
            description: '.',
            value: 0.2,
            timestamp: 123243513,
            type: 2,
        },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        // eslint-disable-next-line no-underscore-dangle
        delete consumer.registry._metrics.new_summary.hashMap;
        // eslint-disable-next-line no-underscore-dangle
        t.matchSnapshot(consumer.registry._metrics);
        t.end();
    });
});

test('time metrics overridden to be summaries', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    consumer.override('time_series', { type: 'summary' });

    const source = src([
        {
            name: 'time_series',
            description: '.',
            time: 10,
            timestamp: 12324357,
        },
        {
            name: 'time_series',
            description: '.',
            time: 12,
            timestamp: 123243510,
        },
        {
            name: 'time_series',
            description: '.',
            time: 1,
            timestamp: 123243513,
        },
        {
            name: 'time_series',
            description: '.',
            time: 10,
            timestamp: 123243514,
        },
        {
            name: 'time_series',
            description: '.',
            time: 11,
            timestamp: 123243515,
        },
        {
            name: 'time_series',
            description: '.',
            time: 12,
            timestamp: 123243516,
        },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        t.true(
            // eslint-disable-next-line no-underscore-dangle
            consumer.registry._metrics.time_series instanceof
                promClient.Summary,
        );
        t.end();
    });
});

test('metrics with labels', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        {
            name: 'my_counter_with_labels',
            description: '.',
            podlet: 'recommendations',
            url: 'http://mylayout.com',
            method: 'GET',
            status: 200,
            meta: {
                buckets: [],
                quantiles: [],
                label1: 'one',
                label2: 'two',
            },
        },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric(
            'my_counter_with_labels',
        );
        t.matchSnapshot(result);
        t.end();
    });
});

test('new metrics with labels', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        new Metric({
            name: 'my_new_counter_with_labels',
            description: '.',
            labels: [
                { name: 'label1', value: 'one' },
                { name: 'label2', value: 'two' },
            ],
            value: 1,
            type: 2,
        }),
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric(
            'my_new_counter_with_labels',
        );
        t.matchSnapshot(result);
        t.end();
    });
});

test('invalid constructor options', (t) => {
    t.plan(1);
    t.throws(() => {
        // eslint-disable-next-line no-unused-vars
        const result = new PrometheusMetricsConsumer({
            client: {},
            fake: 'key',
        });
    }, /Provided value to argument "client" is not a Prometheus client/);
    t.end();
});

test('.override() missing name', (t) => {
    t.plan(1);
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    t.throws(() => {
        consumer.override();
    }, /Invalid "name" given to prometheusMetricsConsumer.override. "name" must only contain alpha-numeric and underscore characters/);
    t.end();
});

test('.override() invalid name', (t) => {
    t.plan(1);
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    t.throws(() => {
        consumer.override('my name is bad');
    }, /Invalid "name" given to prometheusMetricsConsumer.override. "name" must only contain alpha-numeric and underscore characters/);
    t.end();
});

test('.override() invalid type', (t) => {
    t.plan(1);
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    t.throws(() => {
        consumer.override('valid_name', { type: 'not allowed type' });
    }, /Invalid "config" object given to prometheusMetricsConsumer.override. "type" must be one of "counter", "histogram", "gauge", "summary"/);
    t.end();
});

test('.override() sets a metric to be a counter', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    const source = src([{ name: 'valid_name', description: '.', time: 12345 }]);

    consumer.override('valid_name', { type: 'counter' });
    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric('valid_name');
        t.matchSnapshot(result);
        t.end();
    });
});

test('.override() sets a metric to be a histogram with specific buckets', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    const source = src([
        {
            name: 'overridden_histogram',
            description: '.',
            time: 12345,
        },
    ]);

    consumer.override('overridden_histogram', {
        type: 'histogram',
        buckets: {
            bucketStepStart: 1,
            bucketStepFactor: 2,
            bucketStepCount: 8,
        },
    });
    source.pipe(consumer);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric(
            'overridden_histogram',
        );
        t.matchSnapshot(result);
        t.end();
    });
});

test('.override() sets a counter with custom labels', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        {
            name: 'custom_label_counter',
            description: '.',
            url: 'http://example.com',
            method: 'GET',
        },
    ]);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric(
            'custom_label_counter',
        );
        t.matchSnapshot(result);
        t.end();
    });

    consumer.override('custom_label_counter', {
        type: 'counter',
    });
    source.pipe(consumer);
});

test('.override() sets a histogram with custom labels', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        {
            name: 'custom_label_histogram',
            description: '.',
            time: 12324,
            url: 'http://example.com',
            method: 'GET',
        },
    ]);

    consumer.on('finish', () => {
        const result = consumer.registry.getSingleMetric(
            'custom_label_histogram',
        );
        t.matchSnapshot(result);
        t.end();
    });

    consumer.override('custom_label_histogram', {
        type: 'histogram',
    });
    source.pipe(consumer);
});

test('.contentType() method', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    const result = consumer.contentType();
    t.equal(result, 'text/plain; version=0.0.4; charset=utf-8');
    t.end();
});

test('.metrics() method', (t) => {
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    const source = src([
        {
            name: 'custom_label_histogram',
            description: '.',
            time: 12324,
            url: 'http://example.com',
            method: 'GET',
        },
    ]);

    consumer.on('finish', () => {
        const result = consumer.metrics();
        t.matchSnapshot(result);
        t.end();
    });
    source.pipe(consumer);
});

test('guard against bad metric data', (t) => {
    let errCount = 0;
    const log = () => {};
    const err = () => {
        errCount += 1;
    };

    const mockLogger = {
        trace: log,
        debug: log,
        info: log,
        warn: log,
        error: err,
        fatal: log,
    };
    const consumer = new PrometheusMetricsConsumer({
        logger: mockLogger,
        client: promClient,
    });

    const source = src([
        {},
        '',
        { name: 'test' },
        new Metric({
            name: 'test3',
            description: '.',
            labels: [{ name: 'label3', value: 'one' }],
            value: 1,
            type: 2,
        }),
        new Metric({
            name: 'test3',
            description: '.',
            labels: [
                { name: 'label3', value: 'one' },
                { name: 'label4', value: 'two' },
            ],
            value: 1,
            type: 2,
        }),
    ]);

    consumer.on('finish', () => {
        t.equal(errCount, 4);
        t.end();
    });

    source.pipe(consumer);
});
