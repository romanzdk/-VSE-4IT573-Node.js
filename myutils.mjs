import redis from 'redis';
import { promisify } from 'util';
import crypto from 'crypto';

const delay = t => new Promise(res => setTimeout(res, t));

const redisClient = redis.createClient({ host: "redis" });
const dbHset = promisify(redisClient.hset).bind(redisClient);
const dbHgetall = promisify(redisClient.hgetall).bind(redisClient);
const pbkdf2 = promisify(crypto.pbkdf2);
const randomBytes = promisify(crypto.randomBytes);

const authorized = async(req, res) => {
    if (!req.headers.authorization) {
        res.setHeader('WWW-Authenticate', 'Basic');
        res.statusCode = 401;
        res.end();
        return null
    }
    console.log(req.headers.authorization);

    const authHeader = req.headers.authorization.split(' ');
    if (authHeader[0] != 'Basic') {
        res.statusCode = 403;
        res.end();
        console.log('Forbidden!');
        return null
    }

    const [username, password] = Buffer.from(authHeader[1], 'base64').toString().split(':');
    console.log('username: ' + username);
    console.log('password: ' + password);


    let user = await dbHgetall(username);
    if (!user || !user.password) {
        const salt = (await randomBytes(64)).toString('base64');
        const securedPassword = (await pbkdf2(password, salt, 10000, 64, 'sha512')).toString('base64');
        await dbHset(username, "username", username, "password", securedPassword, "salt", salt);
        console.log('Password set!');
        user = await dbHgetall(username);
    } else if (user.password != (await pbkdf2(password, user.salt, 10000, 64, 'sha512')).toString('base64')) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic');
        res.end();
        console.log('Password does not match!');
        return null
    }
    console.log('Authorized ' + username);
    return user;
}

class Middleware {
    #mws = [];
    use(func) {
        this.#mws.push(func);
    }
    go(...par) {
        const mws = this.#mws;
        let pointer = 0;

        function next() {
            if (pointer < mws.length) mws[pointer++](next, ...par);
        }
        next();
    }
}

export { authorized, dbHgetall, dbHset, Middleware, delay }