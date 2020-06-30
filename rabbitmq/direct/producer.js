const amqp = require('amqplib');

async function produce(msg) {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');

  const channel = await connection.createChannel();

  const exchangeName = 'direct_exchange';
  const routingKey = 'hello.direct.demo';
  // 交换机
  await channel.assertExchange(exchangeName, 'direct', {
    durable: true,
  });
  // 发送消息
  await channel.publish(exchangeName, routingKey, Buffer.from(msg));
  // 关闭链接
  await channel.close();
  await connection.close();
}

module.exports = {
  produce,
};
