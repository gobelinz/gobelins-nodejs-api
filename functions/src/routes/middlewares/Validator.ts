import { HttpStatuses } from "../../model/Enum";
import { NextFunction, Request, Response } from "express";
import { body, Result, ValidationChain, ValidationError, validationResult } from "express-validator";

export class Validator {
    public createUpdateCategoryValidationRules(): Array<ValidationChain> {
        return [
            body("name").notEmpty().withMessage(`name is required`).custom((name) => { 
                return new Promise((resolve, reject) => {
                    reject()
                })
             })
        ];
    }

    public createUpdateMovieValidationRules(): Array<ValidationChain> {
        return [
            body("name").notEmpty().isLength({ min: 0, max: 120 }).withMessage(`name is required and max length is 120`),
            body("author").notEmpty().isLength({ min: 0, max: 120 }).withMessage(`author is required and max length is 120`),
            body("img").notEmpty().isURL().withMessage(`img is required`),
            body("video").notEmpty().isURL().withMessage(`video is required`),
            body("category").notEmpty().withMessage(`category is required`),
            body("description").notEmpty().isLength({ min: 0, max: 120 }).withMessage(`description is required and max length is 120`),
        ];
    }

    public validate(req: Request, res: Response, next: NextFunction): void | Response {
        const errors: Result<ValidationError> = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        const extractedErrors: Array<any> = [];
        errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

        return res.status(HttpStatuses.UnprocessableEntity).json({
            errors: extractedErrors
        });
    }
}
