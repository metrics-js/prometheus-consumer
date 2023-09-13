import { Writable } from 'readable-stream';
import { AbstractLogger } from 'abslog';
import PrometheusClient, { Registry } from 'prom-client';

export type PrometheusConsumerOptions = {
    client: typeof PrometheusClient;
    logger?: AbstractLogger;
    bucketStepFactor?: number;
    bucketStepCount?: number;
    bucketStepStart?: number;
};

export type PrometheusConsumerOverrideConfig = {
    type: 'histogram' | 'summary' | 'counter' | 'gauge';
    labels: Array<'url' | 'method' | 'status' | 'layout' | 'podlet'>;
    buckets: {
        bucketStepFactor?: number;
        bucketStepCount?: number;
        bucketStepStart?: number;
    };
};

export default class PrometheusConsumer extends Writable {
    constructor(options: PrometheusConsumerOptions);

    override(metric: string, config: PrometheusConsumerOverrideConfig): void;
    metrics(): ReturnType<Registry['metrics']>;
    contentType(): Registry['contentType'];
}
