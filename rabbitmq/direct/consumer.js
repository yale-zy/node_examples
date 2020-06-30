const amqp = require('amqplib');

async function consume() {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');
  const channel = await connection.createChannel();
  const exchangeName = 'direct_exchange';
  const queueName = 'direct_exchange_queue';
  const routingKey = 'hello.direct.demo';
  // 声明一个交换机
  await channel.assertExchange(exchangeName, 'direct', { durable: true });
  // 声明一个队列
  await channel.assertQueue(queueName);
  // 绑定关系（队列、交换机、路由键）
  await channel.bindQueue(queueName, exchangeName, routingKey);
  // 消费
  await channel.consume(queueName, (msg) => {
    console.log('Direct Consumer：', msg.content.toString());
    channel.ack(msg);
  }, { noAck: false });
  console.log('消费端启动成功！');
}

module.exports = {
  consume,
};
