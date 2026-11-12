import type { RequestHandler } from "express";
import type { ZodType } from "zod";
export const validate = (schema: ZodType, source: "body"|"query"|"params" = "body"): RequestHandler =>
  (req,res,next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    // Express 5 exposes req.query through a getter; do not assign to it.
    if (source === "body") req.body = result.data;
    else if (source === "params") Object.assign(req.params,result.data as object);
    else res.locals.validatedQuery = result.data;
    next();
  };
