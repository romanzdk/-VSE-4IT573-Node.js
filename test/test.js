import assert from "assert";
import { dbHset } from "../myutils.mjs";
import { dbHgetall } from "../myutils.mjs";

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
    })
})