import { Eureka } from 'eureka-js-client'
import { ConfigContract as Config } from './config/ConfigContract';
import { autoInject } from '../system/Injection'

@autoInject
export class EurekaClient {

    private _client: Eureka;
    private instanceId: string;
    private homePageUrl: string;

    constructor(readonly config: Config) {
        
        const { registry: { eureka: { enabled, server: { proto = 'http' } } } } = config;

        if (!enabled) return; // Disable Eureka Client

        this.instanceId = `${config.listen.addr}:${config.name}:${config.listen.port}`;
        this.homePageUrl = `${proto}://${config.listen.addr}:${config.listen.port}`;

        this.setup();
        this.start();
    }


    setup() {

        const { config, homePageUrl, instanceId } = this;
        const { name, listen, registry: { eureka } } = config;
        const { registry: { eureka: { instance } } } = config;

        this._client = new Eureka({
            instance: {
                instanceId,
                app: name,
                hostName: instance.host || listen.host,
                ipAddr: instance.addr || listen.addr,
                port: {
                    '$': instance.port || listen.port,
                    '@enabled': true,
                },
                vipAddress: config.name.toLowerCase(),
                dataCenterInfo: {
                    '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name: 'MyOwn',
                },
                homePageUrl: homePageUrl.concat('/'),
                healthCheckUrl: homePageUrl.concat('/', 'health'),
                statusPageUrl: homePageUrl.concat('/', 'info'),
                leaseInfo: {
                    renewalIntervalInSecs: instance.renewalIntervalInSecs,
                    durationInSecs: instance.durationInSecs
                }
            },
            eureka: {
                host: eureka.server.host,
                port: eureka.server.port,
                servicePath: '/eureka/apps/',
                registryFetchInterval: instance.registryFetchInterval,
                fetchRegistry: true
            },
        } as any);

    }

    public getInstance(): Eureka {
        return this._client;
    }

    public start() {
        this._client.start();
    }

    public stop() {
        this._client.stop();
    }

}