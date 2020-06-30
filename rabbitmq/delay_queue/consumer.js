const amqp = require('amqplib');

async function consume() {
  const connection = await amqp.connect('amqp://guest:guest@127.0.0.1');
  const channel = await connection.createChannel();

  const delayExchangeName = 'delay_exchange';
  const timeoutExchangeName = 'timeout_exchange';

  const delayQueueName = 'delay_queue';
  const timeoutQueueName = 'timeout_queue';
  const routingKey = 'hello.#';
  // 声明交换机
  await channel.assertExchange(delayExchangeName, 'topic', { durable: true });
  await channel.assertExchange(timeoutExchangeName, 'topic', { durable: true });
  // 声明等待队列，并配置死信队列
  await channel.assertQueue(delayQueueName, {
    durable: true, deadLetterExchange: timeoutExchangeName,
  });
  // 生命死信队列
  await channel.assertQueue(timeoutQueueName, { durable: true });
  // 绑定关系（队列、交换机、路由键）
  await channel.bindQueue(delayQueueName, delayExchangeName, routingKey);
  await channel.bindQueue(timeoutQueueName, timeoutExchangeName, routingKey);
  // 消费
  await channel.consume(timeoutQueueName, (msg) => {
    console.log('Delay Consumer：', msg.content.toString());
    channel.ack(msg);
  }, { noAck: false });
  console.log('延时消费端启动成功！');
}

module.exports = {
  consume,
};
