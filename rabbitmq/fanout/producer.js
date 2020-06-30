const amqp = require('amqplib');

async function produce(msg) {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');

  const channel = await connection.createChannel();

  const exchangeName = 'fanout_exchange';
  // 交换机
  await channel.assertExchange(exchangeName, 'fanout', {
    durable: true,
  });
  // 发送消息
  await channel.publish(exchangeName, '', Buffer.from(msg));
  // 关闭链接
  await channel.close();
  await connection.close();
}

module.exports = {
  produce,
};
