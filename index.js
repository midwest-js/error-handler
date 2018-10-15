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

    const promise = config.log ? log(error, config.log) : Promise.resolve()

    promise
      .then(() => {
        // TODO make this more general. and fyi not even
        // @midwest/membership-session implements isAdmin
        if (req.isAdmin && !req.isAdmin()) {
          error.toJSON = function () {
            return _.pick(this, config.mystify.include)
          }
        }

        res.status(error.status).locals = { error }

        if (config.mw) {
          config.mw(req, res, next)
        } else {
          next()
        }
      })
  }
}
