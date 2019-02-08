'use strict';

const { Readable } = require('readable-stream');

const promClient = require('prom-client');
const PrometheusMetricsConsumer = require('../lib');

const src = arr =>
    new Readable({
        objectMode: true,
        read() {
            arr.forEach(el => {
                this.push(el);
            });
            this.push(null);
        },
    });

test('toString returns correct object name', () => {
    expect(
        new PrometheusMetricsConsumer({ client: promClient }).toString(),
    ).toBe('[object PrometheusMetricsConsumer]');
});

test('metrics interpreted as a counter', done => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'my_counter', description: '.' },
        { name: 'my_counter', description: '.' },
        { name: 'my_counter', description: '.' },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        expect(
            consumer.registry.getSingleMetric('my_counter'),
        ).toMatchSnapshot();
        done();
    });
});

test('metrics interpreted as a histogram', done => {
    expect.hasAssertions();
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
        expect(
            consumer.registry.getSingleMetric('my_histogram'),
        ).toMatchSnapshot();
        done();
    });
});

test('gauge metrics interpreted as counters', done => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });

    const source = src([
        { name: 'my_gauge', description: '.', value: 10 },
        { name: 'my_gauge', description: '.', value: 8 },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        expect(consumer.registry.getSingleMetric('my_gauge')).toMatchSnapshot();
        done();
    });
});

test('mixed metrics interpreted correctly', done => {
    expect.hasAssertions();
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
        expect(consumer.registry._metrics).toMatchSnapshot();
        done();
    });
});

test('time metrics overridden to be summaries', done => {
    expect.hasAssertions();
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
        // eslint-disable-next-line no-underscore-dangle
        expect(consumer.registry._metrics.time_series).toBeInstanceOf(
            promClient.Summary,
        );
        done();
    });
});

test('metrics with labels', done => {
    expect.hasAssertions();
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
                label1: 'one',
                label2: 'two',
            },
        },
    ]);

    source.pipe(consumer);

    consumer.on('finish', () => {
        expect(
            consumer.registry.getSingleMetric('my_counter_with_labels'),
        ).toMatchSnapshot();
        done();
    });
});

test('invalid constructor options', () => {
    expect.hasAssertions();
    expect(
        () =>
            new PrometheusMetricsConsumer({ client: promClient, fake: 'key' }),
    ).toThrowError();
});

test('.override() missing name', () => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    expect(() => {
        consumer.override();
    }).toThrowErrorMatchingSnapshot();
});

test('.override() invalid name', () => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    expect(() => {
        consumer.override('my name is bad');
    }).toThrowErrorMatchingSnapshot();
});

test('.override() invalid type', () => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    expect(() => {
        consumer.override('valid_name', { type: 'not allowed type' });
    }).toThrowErrorMatchingSnapshot();
});

test('.override() sets a metric to be a counter', done => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    const source = src([{ name: 'valid_name', description: '.', time: 12345 }]);

    consumer.override('valid_name', { type: 'counter' });
    source.pipe(consumer);

    consumer.on('finish', () => {
        expect(
            consumer.registry.getSingleMetric('valid_name'),
        ).toMatchSnapshot();
        done();
    });
});

test('.override() sets a metric to be a histogram with specific buckets', done => {
    expect.hasAssertions();
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
        expect(
            consumer.registry.getSingleMetric('overridden_histogram'),
        ).toMatchSnapshot();
        done();
    });
});

test('.override() sets a counter with custom labels', done => {
    expect.hasAssertions();
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
        expect(
            consumer.registry.getSingleMetric('custom_label_counter'),
        ).toMatchSnapshot();
        done();
    });

    consumer.override('custom_label_counter', {
        type: 'counter',
    });
    source.pipe(consumer);
});

test('.override() sets a histogram with custom labels', done => {
    expect.hasAssertions();
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
        expect(
            consumer.registry.getSingleMetric('custom_label_histogram'),
        ).toMatchSnapshot();
        done();
    });

    consumer.override('custom_label_histogram', {
        type: 'histogram',
    });
    source.pipe(consumer);
});

test('.contentType() method', () => {
    expect.hasAssertions();
    const consumer = new PrometheusMetricsConsumer({ client: promClient });
    expect(consumer.contentType()).toBe(
        'text/plain; version=0.0.4; charset=utf-8',
    );
});

test('.metrics() method', done => {
    expect.hasAssertions();
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
        expect(consumer.metrics()).toMatchSnapshot();
        done();
    });
    source.pipe(consumer);
});
