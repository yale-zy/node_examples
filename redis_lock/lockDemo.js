const Redis = require('ioredis')
const Redlock = require('redlock')

const client = new Redis({
    port: 6379,
    host: '127.0.0.1',
    family: 4,
    enableReadyCheck: true
})

client.on('error', function (err) {
    console.error(`connect to redis error: ${err.message}`)
})

client.on('ready', function () {
    console.log(`connect to redis success`)
})

const redLock = new Redlock([client], {driftFactor: 0.01, retryCount: 5, retryDelay: 200, retryJitter: 200})

redLock.on('clientError', function(err) {
	console.error(`client error: ${err.name} - ${err.message}`);
})

const resource = 'abc'
const ttl = 100000

async function lockResource() {
    try {
        const lock = await redLock.lock(resource, ttl)
        // do something
        console.log(lock.value)
        const unlock = await lock.unlock()
        return unlock
    } catch (err) {
        console.error(`Lock error: ${err.name} - ${err.message}`);
    }
}

lockResource().then(() => {console.log("Done")})