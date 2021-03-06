const topicConsumer = require('./consumer');
const topicProducer = require('./producer');

async function test() {
  await topicConsumer.consume();
  await topicProducer.produce('hello world');
}

test().then(() => { console.log('done'); }).catch((err) => { console.error(err.message); });
