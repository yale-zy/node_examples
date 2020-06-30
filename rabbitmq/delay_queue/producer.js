const amqp = require('amqplib');

async function produce(msg, delaySeconds) {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');

  const channel = await connection.createChannel();

  const delayExchangeName = 'delay_exchange';
  const timeoutExchangeName = 'timeout_exchange';
  const routingKey = 'hello.delay.demo';
  // 交换机
  await channel.assertExchange(delayExchangeName, 'topic', {
    durable: true,
  });
  await channel.assertExchange(timeoutExchangeName, 'topic', {
    durable: true,
  });
  // 发送消息
  await channel.publish(delayExchangeName, routingKey, Buffer.from(msg),
    { expiration: delaySeconds * 1000 });
  // 关闭链接
  await channel.close();
  await connection.close();
}

module.exports = {
  produce,
};
