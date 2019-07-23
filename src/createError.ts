/*
 * Creates errors
 *
 * @module @midwest/error-handler/createError
 */

import _ from 'lodash'

type TErrorConstructor = new (...args:any[]) => Error

interface IMessageObject {
  message: string
  errorConstructor?: TErrorConstructor
  status :number
}

export default function createError (message: string | IMessageObject, status: number) {
  let props
  let ErrorConstructor: TErrorConstructor = Error

  if (_.isPlainObject(message)) {
    props = _.omit(message as IMessageObject, 'message')

    if (props.errorConstructor) {
      ErrorConstructor = props.errorConstructor
    }

    message = (message as IMessageObject).message || 'Error'
  } else {
    props = {}
  }

  if (_.isPlainObject(status)) {
    Object.assign(props, status)
  } else if (typeof status === 'number') {
    (props as IMessageObject).status = status
  }

  const err = new ErrorConstructor(message as string)

  Object.assign(err, props)

  return err
}
