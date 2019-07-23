// eslint-disable-next-line import/no-unresolved
import { Request, RequestHandler } from 'express'

export interface IRequest extends Request {
  isAdmin?: () => boolean
  user?: any
}

export interface IError extends Error {
  body?: any
  details?: any
  errors: any[]
  query?: any
  status?: number
  statusText?: string
  xhr?: boolean
}

export interface IConfig {
  mw?: RequestHandler
  log?: ILogConfig
  mystify?: { include: string[] }
}

export interface ILogConfig {
  console?: Function
  ignore?: number[]
  loggers?: Function[]
}
