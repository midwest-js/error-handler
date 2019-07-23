/*
 * Error handling middleware factory
 *
 * @see module:@midwest/error-handler/format
 * @see module:@midwest/error-handler/log
 */

// modules > 3rd party
import _ from 'lodash'

// modules > internal
import format from './format'
import log from './log'
// eslint-disable-next-line import/no-unresolved
import { ErrorRequestHandler } from 'express'
import { IConfig, IRequest } from './types'

export { format, log }

export default function (config: IConfig): ErrorRequestHandler {
  if (!config) {
    throw new Error('`config` required for errorHandler middleware factory')
  }

  return function errorHandler (error, req: IRequest, res, next) {
    error = format(error, req)

    const promise: Promise<any> = config.log ? log(error, config.log) : Promise.resolve()

    promise
      .then(() => {
        // TODO make this more general. and fyi not even
        // @midwest/membership-session implements isAdmin
        if (req.isAdmin && !req.isAdmin()) {
          error.toJSON = function () {
            return _.pick(this, config.mystify!.include)
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
