import * as schema from "@api/v1/db/schema";
import { UserResBody } from "@api/v1/models";
import { UsersService } from "@api/v1/resources/users/users.service";
import { User } from "@api/v1/resources/users/users.type";
import {
  Request,
  Response,
  Application,
  NextFunction,
  RequestHandler,
} from "express";

declare global {
  interface SuccessBody {
    code?: number;
    data?: any;
    i18n?: { key: string; args?: any };
  }

  interface FailBody {
    code?: number;
    i18n: { key: string; args?: any };
    details?: any;
  }

  interface ErrorBody {
    code?: number;
    i18n: { key: string; args?: any };
    details?: any;
  }

  export type RequestHandler<Params = {}, ReqBody = {}, ResBody = {}> = (
    req: Request<Params, {}, ReqBody>,
    res: Response<Response>
  ) => void;

  namespace Express {
    interface User extends schema.User {}
    interface Response {
      success(body: SuccessBody): void;
      fail(body: FailBody): void;
      error(body: ErrorBody): void;
    }
  }
}
