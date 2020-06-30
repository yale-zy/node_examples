const amqp = require('amqplib');

async function consume() {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');
  const channel = await connection.createChannel();
  const exchangeName = 'fanout_exchange';
  const queueName = 'fanout_exchange_queue';
  // 声明一个交换机
  await channel.assertExchange(exchangeName, 'fanout', { durable: true });
  // 声明一个队列
  await channel.assertQueue(queueName);
  // 绑定关系（队列、交换机、路由键）
  await channel.bindQueue(queueName, exchangeName, '');
  // 消费
  await channel.consume(queueName, (msg) => {
    console.log('Fanout Consumer：', msg.content.toString());
    channel.ack(msg);
  }, { noAck: false });
  console.log('消费端启动成功！');
}

module.exports = {
  consume,
};
