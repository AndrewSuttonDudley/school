import bunyan from 'bunyan';
import raven from 'raven';
import { SentryStream } from 'bunyan-sentry-stream';
import Bunyan2Loggly from 'bunyan-loggly';

export const consoleStreamFactory = (options) => {
  function MyRawStream() {}
  MyRawStream.prototype.write = (record) => {
    /* eslint-disable no-console */
    const timestamp = record.time.toISOString();
    const level = bunyan.nameFromLevel[record.level];
    const msg = record.msg;

    const stack = record.err && record.err.stack;

    console.log(`[${timestamp}] ${level}: ${msg}`);
    if (stack) {
      console.log('stack trace: ', stack);
    }
  };

  const defaults = {
    stream: new MyRawStream(),
    type: 'raw',
    name: 'console',
    level: 'debug',
  };

  const config = Object.assign({}, defaults, options);
  return config;
};

export const sentryStreamFactory = (options) => {
  const client = new raven.Client(process.env.SENTRY_DSN, {
    tags: {
      lambda: process.env.AWS_LAMBDA_FUNCTION_NAME,
      version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      service: process.env.SERVICE,
      stage: process.env.STAGE,
      region: process.env.REGION,
    },
  });

  const stream = new SentryStream(client);

  const defaults = {
    name: 'sentry',
    level: 'error',
    type: 'raw',
    stream,
  };

  const config = Object.assign({}, defaults, options);
  return config;
};

export const logglyStreamFactory = (options) => {
  const tags = [
    `lambda-${process.env.AWS_LAMBDA_FUNCTION_NAME}`,
    `service-${process.env.SERVICE}`,
    `stage-${process.env.STAGE}`,
    `region-${process.env.REGION}`,
    `account-${process.env.TRUTH_ACCOUNT_NAME}`,
  ];

  // Loggly doesn't like special characters in their tags so we strip them
  // from, for example, "$LATEST"
  const version = process.env.AWS_LAMBDA_FUNCTION_VERSION;
  if (version) {
    tags.push(`version-${version.replace('$', '')}`);
  }

  const stream = new Bunyan2Loggly({
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags,
  });

  const defaults = {
    name: 'loggly',
    level: 'error',
    type: 'raw',
    stream,
  };

  const config = Object.assign({}, defaults, options);
  return config;
};

export default {
  consoleStreamFactory,
  sentryStreamFactory,
  logglyStreamFactory,
};
