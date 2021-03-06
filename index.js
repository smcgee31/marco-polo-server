'use strict';

require('dotenv').config();
const { host, port } = process.env;
const log = require('./log');
const Hapi = require('@hapi/hapi');
const registerPlugins = require('./plugins');

const server = Hapi.server({
  host,
  port,
  routes: {
    validate: {
      failAction: async (request, h, error) => {
        log.warn('Validation error:', error.message);
        throw error;
      },
    },
  },
});

async function initialize() {
  try {
    await registerPlugins(server);
    await server.initialize();

    // Check if the file was called directly ex. npm start
    //   if module.parent exists, then it was required by another
    //   file (eg. test file) and server.start() will not be called
    /* istanbul ignore next */
    if (!module.parent) {
      await server.start();
      log.info(`Revelabit-Server started on port ${port}`);
    }

    return server;
  } catch (error) {
    /* istanbul ignore next */
    log.error(error);
    throw error;
  }
}

module.exports = initialize();
