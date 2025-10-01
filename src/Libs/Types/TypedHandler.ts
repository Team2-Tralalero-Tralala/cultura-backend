import type { Request, Response } from "express";

type ClassType<T = any> = new (...args: any[]) => T;

export type commonDto = {
  body?: ClassType;
  query?: ClassType;
  params?: ClassType;
};

type ReqFromDto<D extends commonDto> = Request<
  D["params"] extends ClassType ? InstanceType<D["params"]> : Record<string, any>,
  any,
  D["body"] extends ClassType ? InstanceType<D["body"]> : any,
  D["query"] extends ClassType ? InstanceType<D["query"]> : any
>;

export type TypedHandlerFromDto<D extends commonDto> = (
  req: ReqFromDto<D>,
  res: Response
) => Promise<any>;
