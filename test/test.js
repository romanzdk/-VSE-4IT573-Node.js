"use strict";
import assert from "assert";
import { Middleware } from "../myutils.mjs";
import { dbHset } from "../myutils.mjs";
import { dbHgetall } from "../myutils.mjs";
import { setYOffset } from "../businessLogic.mjs";

describe('true', () => {
    it('should be true', () => {
        assert.strictEqual(true, true);
    })
});

describe('myutils', () => {
    describe('dbHgetall', () => {
        before(async() => {
            await dbHset('random key', 'name', 'testname')
        })
        it('should return what was previously stored in db', async() => {
            assert.strictEqual(
                (await dbHgetall('random key')).name, 'testname'
            )
        })
    });
    describe('Middleware', () => {
        let mw;
        before(() => {
            mw = new Middleware;
            mw.use((next, o) => {
                o.first = "rewrited";
                next();
            });
            mw.use((next, o) => {
                o.second = "je druhy";
                next();
            });
            mw.use((next, o) => {
                o.first = "je to prvni";
                next();
            });
        })
        it('should add objects first and second properties', async() => {
            let obj = { first: 1 };
            await mw.go(obj);
            assert.deepStrictEqual(obj, { first: "je to prvni", second: "je druhy" })
        })
    })
});

describe('businessLogic', () => {
    describe('setYOffset', () => {
        it('it should decrease y by 50', () => {
            let o = { y: 80 };
            setYOffset();
            assert.strictEqual();
        });
        it('should do nothing if y not present');
        it('should set to 0 if y <= 50');
    });
});