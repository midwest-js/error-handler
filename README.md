# Midwest Error Handler

The error handler formats and logs errors. Custom, promise based loggers enable
storing to database and other async actions.

## Installation

```
$ npm install @midwest/error-handler
```

## Usage

```js
const errorHandler = require('@midwest/error-handler')(config.errorHandler)

server.use([
  require('midwest/middleware/ensure-found'),
  // format and log error
  errorHandler,
  // respond
  require('@midwest/responder')({
    errorHandler,
    logError: require('@midwest/error-handler/log'),
  }),
])
```

## Configuration

Example configuration

```js
const _ = require('lodash')
const master = require('../templates/error')

const services = require('../services/errors')

function save (error) {
  return services.handlers.create(error)
}

const defaults = {
  // only include certain properties when sending error to client
  mystify: {
    include: ['errors', 'message', 'name', 'status', 'statusText'],
  },

  // middleware that is called before the errorHandler calls `next()`
  mw: (req, res, next) => {
    res.master = master

    next()
  },

  // log options
  log: {
    console: true,
  },
}

module.exports = _.merge(defaults, {
  production: {
    log: {
      console: false,

      loggers: [
        save,
      ],
    },
  },
}[process.env.NODE_ENV])
```
