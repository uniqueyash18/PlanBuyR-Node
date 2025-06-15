interface SuccessResponseParams {
    message: string;
    data?: any;
    others?: Record<string, any>;
    statusCode?: number;
    total?: number;
}

interface ErrorResponseParams {
    message: string;
    others?: Record<string, any>;
    statusCode?: number;
    errorInfo?: any;
    error?: any;
}

interface SendErrorResponseParams extends ErrorResponseParams {
    res: any;
    error?: any;
}

interface SendSuccessResponseParams extends SuccessResponseParams {
    res: any;
}

export const successResponse = ({
    message,
    data,
    others,
    statusCode,
    total,
}: SuccessResponseParams) => ({
    statusCode: statusCode || 200,
    success: true,
    message: message,
    total,
    ...(data && { data }),
    ...(others && others),
});

export const errorResponse = ({ message, others, statusCode, errorInfo }: ErrorResponseParams) => ({
    statusCode: statusCode || 400,
    success: false,
    message,
    ...(others && others),
    ...(errorInfo && { errorInfo }),
});

export const sendErrorResponse = ({
    message,
    others,
    statusCode = 400,
    error,
    res,
}: SendErrorResponseParams) => {
    return res
        .status(statusCode)
        .json(errorResponse({ message, others, statusCode, error }));
};

export const sendSuccessResponse = ({
    message,
    data,
    others,
    statusCode = 200,
    total,
    res,
}: SendSuccessResponseParams) => {
    return res
        .status(statusCode)
        .json(successResponse({ message, data, others, statusCode, total }));
};
