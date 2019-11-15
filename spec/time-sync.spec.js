const expect = require('chai').expect;
const timeSync = require('../src/helpers/time-sync');
const sinon = require('sinon');

describe('time sync', () => {
    it('should handle time delta', () => {
        const startDateTimeString = '2019-06-19T08:00:00.000Z';
        const startDateTime = new Date(startDateTimeString);

        // Seconds
        const secondsDelta = startDateTime.getTime() + 10 * 1000;

        const tenSecondsInFuture = timeSync.dateFromTimeDelta(secondsDelta, startDateTime);
        expect(timeSync.isValidDate(tenSecondsInFuture)).to.be.true;
        expect(tenSecondsInFuture.getSeconds()).to.equal(10);

        const tenSecondsInPast = timeSync.dateFromTimeDelta(-secondsDelta, startDateTime);
        expect(timeSync.isValidDate(tenSecondsInPast)).to.be.true;
        expect(tenSecondsInPast.getSeconds()).to.equal(50);

        // Minutes
        const minutesDelta = startDateTime.getTime() + 10 * 60 * 1000;

        const tenMinutesInFuture = timeSync.dateFromTimeDelta(minutesDelta, startDateTime);
        expect(timeSync.isValidDate(tenMinutesInFuture)).to.be.true;
        expect(tenMinutesInFuture.getMinutes()).to.equal(10);

        const tenMinutesInPast = timeSync.dateFromTimeDelta(-minutesDelta, startDateTime);
        expect(timeSync.isValidDate(tenMinutesInPast)).to.be.true;
        expect(tenMinutesInPast.getMinutes()).to.equal(50);
    });

    describe('syncTime local', () => {
        afterEach(() => {
            localStorage.clear();
        });

        it('should handle valid time delta', done => {
            const expectedDelta = 10000;
            timeSync.syncTime(expectedDelta, actualDelta => {
                expect(actualDelta).to.equal(expectedDelta);
                done();
            });
        });

        it('should handle invalid null time delta', done => {
            const expectedDelta = 610;
            localStorage.setItem(timeSync.storageKey, createDeltaStorage(expectedDelta));

            timeSync.syncTime(null, actualDelta => {
                expect(actualDelta).to.equal(expectedDelta);
                done();
            });
        });

        it('should handle invalid string time delta', done => {
            const expectedDelta = 555;
            localStorage.setItem(timeSync.storageKey, createDeltaStorage(expectedDelta));

            timeSync.syncTime('foo', actualDelta => {
                expect(actualDelta).to.equal(expectedDelta);
                done();
            });
        });

        it('should handle cached time delta', done => {
            const expectedDelta = 20000;
            const storageProvider = {
                setItem: () => {},
                getItem: () => createDeltaStorage(expectedDelta)
            };

            timeSync.setStorageProvider(storageProvider);

            timeSync.syncTime(null, actualDelta => {
                expect(actualDelta).to.equal(expectedDelta);
                done();
            });

            timeSync.setStorageProvider(null);
        });
    });

    describe('syncTime remote', () => {
        let xhr;
        let requests;

        beforeEach(() => {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = req => requests.push(req);
            localStorage.clear();
        });

        afterEach(() => {
            requests = [];
            xhr.restore();
        });

        it('should handle successful network request', done => {
            const now = new Date();
            const then = new Date(now.getTime() + 10000);

            timeSync.syncTime(null, actualDelta => {
                expectToBeWithinThreshold(actualDelta, 10000);
                done();
            });

            requests[0].respond(200, {}, JSON.stringify({ serverTime: then.toISOString() }));
        });

        it('should handle failed network request', done => {
            timeSync.syncTime(null, actualDelta => {
                expectToBeWithinThreshold(actualDelta, 0);
                done();
            });

            requests[0].respond(500);
        });

        it('should handle network request timeout', done => {
            const clock = sinon.useFakeTimers();

            timeSync.syncTime(null, actualDelta => {
                expectToBeWithinThreshold(actualDelta, 0);
                done();
            });

            clock.tick(15000);
            clock.restore();
        }).timeout(16000); // Increase test timeout beyond default 2 seconds.

        it('should cache time delta with TTL of 1 minute', done => {
            const now = new Date();
            const then = new Date(now.getTime() + 10000);

            // Cache should be empty
            expect(timeSync.getCachedTimeDelta()).to.equal(0);

            timeSync.syncTime(null, actualDelta => {
                const expectedDelta = 10000;
                expectToBeWithinThreshold(actualDelta, expectedDelta);

                // Cache should be populated
                expectToBeWithinThreshold(timeSync.getCachedTimeDelta(), expectedDelta);

                // Cache expiration should be in 1 minute
                const cachedData = JSON.parse(localStorage.getItem(timeSync.storageKey));
                const cacheExpiry = new Date(cachedData.ts);
                expectToBeWithinThreshold(now.getTime() + 60 * 1000, cacheExpiry.getTime());

                done();
            });

            requests[0].respond(200, {}, JSON.stringify({ serverTime: then.toISOString() }));
        });

        it('should handle multiple sync attempts', () => {
            // TODO: Test
        });
    });
});

const expectToBeWithinThreshold = (actual, expected, threshold = 10) => {
    const min = expected - threshold;
    const max = expected + threshold;

    expect(actual).to.be.gte(min);
    expect(actual).to.be.lte(max);
};

const createDeltaStorage = delta => {
    return JSON.stringify({
        td: delta,
        ts: (new Date()).getTime() + 60 * 1000
    });
};
