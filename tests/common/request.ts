import "mocha";
import { expect } from 'chai';
import { ServiceCall } from "../../helper/Request";

describe("Calling service-self", function () {

    it("should be successful", () => {
        const Req = { method: "GET", uri: "/info" }
        return ServiceCall("test", Req).then(testFinal);
        
        function testFinal(resp) {
            expect(resp.statusCode).to.eql(200);
        }
    });

});