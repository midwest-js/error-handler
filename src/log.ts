/*
 * Module that logs errors to console
 * and/or database.
 *
 * This module expects a config file located
 * at `server/config/error-handler`.
 *
 * @module @midwest/error-handler/log
 */

import _ from 'lodash'

// modules > 3rd party
import chalk from 'chalk'

// modules > internal
import highlightStack from 'highlight-stack'

import { ILogConfig, IError } from './types'

// string added to all errors logged to console
const prefix = `[${chalk.red('EE')}] `

/*
 * Default console logging function. Will be used
 * if `config.console` is not set or is not a function.
 *
 * @private
 */
function defaultConsole (error: IError) {
  const status = error.status || 500
  // note unformatted error will not have any own properties to loop over. ie,
  // format needs to be called first
  let styledStatus
  let message

  if (status < 400) {
    // redirect
    styledStatus = chalk.cyan(status.toString(10))
  } else if (status < 500) {
    // client error
    styledStatus = chalk.yellow(status.toString(10))
  } else {
    // server error
    styledStatus = chalk.red(status.toString(10))
    message = `[${error.name}] ${error.message}`
  }

  styledStatus = chalk.bold(styledStatus)

  console.error(`${prefix}${styledStatus} ${(message || error.message)}`)

  // 422 is missing properties, show what they have sent
  if (error.status === 422 && error.body) {
    console.error(`${prefix}body: ${JSON.stringify(error.body, null, '  ')}`)
  }

  if (error.stack) {
    console.error(`${prefix}${highlightStack(error.stack.slice(error.stack.indexOf('\n') + 1)).trim()}\n`)
  }
}

/*
 * Logs the error.
 *
 * @param {Error} error - Error to be logged
 * @param {IncomingMessage} req - Request object of current request.
 * Used to add additional info to error such as logged in user.
 * @param {Object} config - Optional config object to override the default
 * config on a per log basis.
 */

export default function logError (error: IError, config: ILogConfig = {}): Promise<any> {
  if (!config.ignore || (error.status && config.ignore.indexOf(error.status) < 0)) {
    const loggers = [
      (_.isFunction(config.console) ? config.console : defaultConsole)(error),
      ...(config.loggers ? config.loggers.map(logger => logger(error)) : []),
    ]

    return Promise.all(loggers)
  }

  return Promise.resolve()
}
