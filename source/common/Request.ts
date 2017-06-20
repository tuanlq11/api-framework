import { join as pathJoin } from "path";
import * as request from "request";

const Noop                  = (...args) => undefined;
const { DATA_DIR, APP_ENV } = process.env;
const Config                = pathJoin(DATA_DIR, "config." + APP_ENV);
const Eureka                = require(Config).registry.eureka;
const Gateway               = "http://" + Eureka.host + // in case using domain
    (!!Eureka.port ? ":" + Eureka.port : "");

/**
 * create a request to one registered service
 * @param service name of requesting service
 * @param req request information (method, uri, body, headers, ...)
 * @param success handler for successful call
 * @param error handler for any error occured
 */
export function ServiceCall(service: string,
                            req: { method: string, uri: string, body?: any, headers?: any },
                            success: Function = Noop, error: Function = Noop) {
    // for serializable json body
    const opts: any             = Object.assign({ json: true }, req);
    opts.uri                    = Gateway + "/" + service + req.uri;
    // create a promise wrapper
    const promise: Promise<any> = new Promise(
        (resolve, reject) => {
            request(opts, (err, response) => {
                if (err) reject(err);
                else resolve(response);
            });
        });

    promise.then(
        resp => {
            if (resp) success(resp);
        },
        err => {
            if (err) error(err);
        }
    );

    return promise;

}

/**
 * request to create an Audit log record with following parameters;
 * pass null or undefined data in case no data resulted from event
 * @param user Id of the actor
 * @param event main action
 * @param data result data from the action
 * @param object data object has been carried out (id, type, before)
 * @param success handler for successful call
 * @param error handler for any error occured
 */
export function Audit(user: string | number, event: string, data: any = {},
                      object: { id: string | number, type: string, before?: any },
                      success: Function                               = Noop, error: Function = Noop) {

    const body = { user, event, object, data };
    const req  = { method: "post", uri: "/record", body };
    // TODO: add headers for required permission
    // TODO: handle requesting error
    return ServiceCall("audit", req, success, error);

}