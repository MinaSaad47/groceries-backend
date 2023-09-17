import { UserResBody } from "@api/v1/models";
import { Request, Response, NextFunction } from "express";

declare global {
  interface SuccessBody {
    code?: number;
    data?: any;
    i18n?: { key: string; args?: any };
  }

  interface FailBody {
    code?: number;
    i18n: { key: string; args?: any };
    data?: any;
  }

  interface ErrorBody {
    code?: number;
    i18n: { key: string; args?: any };
    data?: any;
  }

  namespace Express {
    interface User extends UserResBody {}
    interface Response {
      success(body: SuccessBody): void;
      fail(body: FailBody): void;
      error(body: ErrorBody): void;
    }
  }
}
