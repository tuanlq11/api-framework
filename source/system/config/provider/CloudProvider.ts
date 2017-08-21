'use strict';

import { Url, parse } from 'url';
import * as HTTP from 'http';

import { JsonLogger } from '../../impl/JsonLogger';
import { ConfigProviderImpl } from "../ConfigProviderImpl";

const _ = require('underscore-x');

export class CloudProvider implements ConfigProviderImpl {

    private readonly logger: JsonLogger = new JsonLogger();

    private source: StaticSource;

    private url: Url;
    private content: any = {};

    async load() {

        this.logger.info(`Fetching configuration from ${this.url.href}`);

        return await (new Promise((resolve, reject) => {
            HTTP.request({
                protocol: this.url.protocol,
                hostname: this.url.hostname,
                port:     this.url.port as any,
                path:     this.getPath(),
                auth:     this.getAuth()
            }, (res) => {
                if (res.statusCode != 200) {
                    this.logger.error(`Server response status code: ${res.statusCode}`);
                    resolve();
                }

                res.setEncoding('utf8');
                let response = '';

                res.on('data', (data) => {
                    response += data;
                });

                res.on('end', () => {
                    try {
                        const body = JSON.parse(response);
                        this.parse(body.propertySources);
                        this.logger.info('Fetch config is successful!');
                        resolve(this);
                    } catch (e) {
                        this.logger.error(e);
                        resolve(e);
                    }
                });

            }).end();
        }));

    }

    exists(key: string): boolean {
        return true;
    }

    getAuth() {
        if (this.source.registry.configuration.auth) {
            return this.source.registry.configuration.auth.user + ':' + this.source.registry.configuration.auth.pass;
        }

        return this.url.auth;
    }

    getPath(): string | undefined {
        if (this.url.path === undefined) return undefined;

        const path = this.url.path;
        return (
            path.endsWith('/') ? path : path + '/').concat(
            encodeURIComponent(this.source.name), '/',
            encodeURIComponent(this.source.registry.configuration.profiles.join(',')), '/',
            this.source.registry.configuration.label ? encodeURIComponent(this.source.registry.configuration.label) : ''
        );
    }

    getContent(): any {
        return this.content;
    }

    setSource(source: StaticSource): CloudProvider {
        this.source = _.extend_x({
            registry: {
                configuration: {
                    proto:  'http',
                    prefix: 'config'
                }
            }
        }, source);

        const config: any = this.source.registry.configuration;

        this.url = parse(
            config.proto.concat(
                '://',
                config.host,
                ':',
                (config.port + ''),
                '/',
                (config.prefix || '')
            ));

        return this;

    }

    private parseRecur(kArr: any[], value: any, level: number) {

        if (kArr.length == 0) return value;

        const key   = kArr[0].toLowerCase();
        const kArrN = kArr.slice(1);

        let result  = {};
        result[key] = this.parseRecur(kArrN, value, level + 1);

        if (level === 0 && this[key] === undefined) {
            Object.defineProperty(this, key, {
                get: () => {
                    return this.content[key];
                }
            });
        }

        return result;
    }

    private parse(body: any[]) {
        for (const record of body) {
            const { source } = record;
            for (const key in source) {
                _.extend_x(this.content, this.parseRecur(key.split('.'), source[key], 0));
            }
        }
    }
}

export interface StaticSource {
    name: string;
    registry: {
        configuration: RegistryConfig
    };
}

export interface RegistryConfig {
    host: string;
    port: number;
    label?: string;
    profiles: string[];
    proto?: string;
    prefix?: string;
    auth?: { user: string, pass: string }
}