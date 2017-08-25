import { Eureka } from 'eureka-js-client'
import { ConfigImpl } from "./config/ConfigImpl";

export class EurekaClient {

    private _eurekaClient: Eureka;

    async init(config: ConfigImpl) {
        const proto       = config.registry.eureka.server.proto || 'http';
        const instanceId  = config.listen.addr.concat(':', config.name, ':', config.listen.port.toString());
        const homePageUrl = proto.concat('://', config.listen.addr, ':', config.listen.port.toString());

        this._eurekaClient = new Eureka({
            instance: {
                instanceId:     instanceId,
                app:            config.name,
                hostName:       config.registry.eureka.instance.host || config.listen.host,
                ipAddr:         config.registry.eureka.instance.addr || config.listen.addr,
                port:           {
                    '$':        config.registry.eureka.instance.port || config.listen.port,
                    '@enabled': true,
                },
                vipAddress:     config.name.toLowerCase(),
                dataCenterInfo: {
                    '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    name:     'MyOwn',
                },
                homePageUrl:    homePageUrl.concat('/'),
                healthCheckUrl: homePageUrl.concat('/', 'health'),
                statusPageUrl:  homePageUrl.concat('/', 'info'),
                leaseInfo:      {
                    renewalIntervalInSecs: config.registry.eureka.instance.renewalIntervalInSecs,
                    durationInSecs:        config.registry.eureka.instance.durationInSecs
                }
            },
            eureka:   {
                host:                  config.registry.eureka.server.host,
                port:                  config.registry.eureka.server.port,
                servicePath:           '/eureka/apps/',
                registryFetchInterval: config.registry.eureka.instance.registryFetchInterval,
                fetchRegistry:         true
            },
        } as any);
    }

    public getInstance(): Eureka {
        return this._eurekaClient;
    }

    public start() {
        this._eurekaClient.start();
    }

    public stop() {
        this._eurekaClient.stop();
    }

}