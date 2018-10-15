/*
 * Error handling middleware factory
 *
 * @see module:@midwest/error-handler/format
 * @see module:@midwest/error-handler/log
 */
'use strict'

// modules > 3rd party
const _ = require('lodash')

// modules > internal
const format = require('./format')
const log = require('./log')

module.exports = function (config) {
  if (!config) {
    throw new Error('`config` required for errorHandler middleware factory')
  }

  return function errorHandler (error, req, res, next) {
    error = format(error, req, config)

    log(error, req, config.log)

    // limit what properties are sent to the client by overriding toJSON().
    if (req.isAdmin && !req.isAdmin()) {
      error.toJSON = function () {
        return _.pick(this, config.mystify.properties)
      }
    }

    res.status(error.status).locals = { error }

    if (config.post) {
      config.post(req, res, next)
    } else {
      next()
    }
  }
}
