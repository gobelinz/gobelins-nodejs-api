const enum HttpStatuses {
    OK = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Forbidden = 403,
    NotFound = 404,
    UnprocessableEntity = 422,
    InternalServerError = 500
}

export {HttpStatuses};
