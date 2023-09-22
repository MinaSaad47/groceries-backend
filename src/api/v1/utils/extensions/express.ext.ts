import { Request, Response, NextFunction } from "express";

export default function responseExtension(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.success = ({ i18n, data, code = 200 }: SuccessBody): void => {
    res.status(code).json({
      code,
      status: "success",
      data,
      message: !i18n
        ? undefined
        : req.t(`success.${code}.${i18n.key}`, i18n.args),
    });
  };
  res.fail = ({ i18n, code = 400, details: data }: FailBody): void => {
    res.status(code).json({
      code,
      status: "fail",
      message: req.t(`fail.${code}.${i18n.key}`, i18n.args),
      data,
    });
  };
  res.error = ({ i18n, details: data, code = 500 }: ErrorBody): void => {
    res.status(code).json({
      code,
      status: "error",
      message: req.t(`error.${code}.${i18n.key}`, i18n.args),
      data,
    });
  };

  next();
}
