const { initTracer: initJaegerTracer } = require('jaeger-client');
const { FORMAT_HTTP_HEADERS } = require('opentracing');

// const TraceKeyInRequestHeader = 'uber-trace-id';

class CustomizedSpan {
  constructor({ operationName }) {
    this.operationName = operationName;
  }

  getSpan() {
    return this.span;
  }

  setSpan(span) {
    this.span = span;
  }

  setTag(tagName, tagValue) {
    try {
      if (this.span) {
        this.span.setTag(tagName, tagValue);
      }
    } catch (err) {
      console.error(`[setTag] Error Message: ${err.message}`);
    }
  }

  log({ event, logContent }) {
    try {
      if (this.span) {
        this.span.log({
          event,
          value: logContent,
        });
      }
    } catch (err) {
      console.error(`[log] Error Message: ${err.message}`);
    }
  }

  finish() {
    try {
      if (this.span) {
        this.span.finish();
      }
    } catch (err) {
      console.error(`[finish] Error Message: ${err.message}`);
    }
  }
}

class CustomizedTracer {
  constructor({ serviceName }) {
    this.serviceName = serviceName;
    this.tracer = this.initTracer();
    this.traceId = null;
  }

  initTracer() {
    let tracer = null;
    try {
      const config = {
        serviceName: this.serviceName,
        sampler: {
          type: 'const',
          param: 1,
        },
      };
      const options = {};
      tracer = initJaegerTracer(config, options);
    } catch (err) {
      console.error(`[initTracer] Error Message: ${err.message}`);
    }
    return tracer;
  }

  createBaseSpan({ operationName, reqHeaders = {} }) {
    const customizeSpan = new CustomizedSpan({ operationName });

    try {
      const parentSpanContext = this.tracer.extract(FORMAT_HTTP_HEADERS, reqHeaders);
      let span = null;
      if (parentSpanContext.isValid) {
        span = this.tracer.startSpan(operationName, {
          childOf: parentSpanContext,
        });
      } else {
        span = this.tracer.startSpan(operationName);
      }
      this.traceId = span.context().traceIdStr;
      customizeSpan.setSpan(span);
    } catch (err) {
      console.error(`[createChildSpanFromBaseOnHeaders] Error Message: ${err.message}`);
    }

    return customizeSpan;
  }

  createSubSpan({ operationName, parentSpan, isChild }) {
    const customizeSpan = new CustomizedSpan({ operationName });

    try {
      let span = null;
      if (isChild) {
        span = this.tracer.startSpan(operationName, {
          childOf: parentSpan.getSpan().context(),
        });
      } else {
        span = this.tracer.startSpan(operationName);
      }
      customizeSpan.setSpan(span);
    } catch (err) {
      console.error(`[createSubSpan] Error Message: ${err.message}`);
    }

    return customizeSpan;
  }

  /**
   * 发送 http 请求时，将 traceId 注入到 request header中
   */
  injectTracer({ customizeSpan, headers }) {
    try {
      if (!(customizeSpan && headers)) {
        throw Error('Required parameter is NULL or empty');
      }
      this.tracer.inject(customizeSpan.getSpan(), FORMAT_HTTP_HEADERS, headers);
    } catch (err) {
      console.error(`[injectTracer] Error Message: ${err.message}`);
    }
  }

  close() {
    try {
      this.tracer.close();
    } catch (err) {
      console.error(`[close] Error Message: ${err.message}`);
    }
  }
}

module.exports = {
  CustomizedSpan,
  CustomizedTracer,
};
