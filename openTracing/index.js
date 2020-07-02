const util = require('util');
const { CustomizedTracer } = require('./tracer');

const setTimeoutPromise = util.promisify(setTimeout);

async function test() {
  const trace = new CustomizedTracer({ serviceName: 'demo' });
  const span1 = trace.createBaseSpan({ operationName: 'operation_1' });
  await setTimeoutPromise(1000);
  const span2 = trace.createSubSpan({ operationName: 'operation_2', parentSpan: span1, isChild: true });
  span2.log({ event: 'testing', logContent: 'hello world' });
  const span3 = trace.createSubSpan({ operationName: 'operation_3', parentSpan: span1, isChild: true });
  span3.setTag('simple_tag', 'simple_value');
  span3.finish();
  span2.finish();
  span1.finish();
  trace.close();
}

test().then(() => { console.log('done'); }).catch((err) => { console.error(err.message); });
