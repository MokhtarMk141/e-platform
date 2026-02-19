import { NextFunction, Request, Response } from "express";

type AsyncRequestHandler<TRequest extends Request = Request, TResponse extends Response = Response> = (
  req: TRequest,
  res: TResponse,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler =
  <TRequest extends Request = Request, TResponse extends Response = Response>(
    fn: AsyncRequestHandler<TRequest, TResponse>
  ) =>
  (req: TRequest, res: TResponse, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
