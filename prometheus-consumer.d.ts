import { Writable } from 'readable-stream';
import { AbstractLogger } from 'abslog';
import PrometheusClient, { Registry } from 'prom-client';

declare class PrometheusConsumer extends Writable {
    constructor(options: PrometheusConsumer.PrometheusConsumerOptions);

    override(
        metric: string,
        config: PrometheusConsumer.PrometheusConsumerOverrideConfig,
    ): void;
    metrics(): ReturnType<Registry['metrics']>;
    contentType(): Registry['contentType'];
}

declare namespace PrometheusConsumer {
    export type PrometheusConsumerOptions = {
        client: PrometheusClient;
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
}

export = PrometheusConsumer;