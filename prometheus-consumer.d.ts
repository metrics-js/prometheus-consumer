import { Writable } from 'readable-stream';
import { AbstractLogger } from 'abslog';
import * as PrometheusClient from 'prom-client';

declare class PrometheusConsumer extends Writable {
    constructor(options: PrometheusConsumer.PrometheusConsumerOptions);

    override(
        metric: string,
        config: PrometheusConsumer.PrometheusConsumerOverrideConfig,
    ): void;
    readonly registry: PrometheusClient.Registry;
    metrics(): ReturnType<PrometheusClient.Registry['metrics']>;
    contentType(): PrometheusClient.Registry['contentType'];
}

declare namespace PrometheusConsumer {
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
}

export = PrometheusConsumer;
