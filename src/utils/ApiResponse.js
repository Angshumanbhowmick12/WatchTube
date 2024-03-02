class ApiResponse{
    constructor(statusCode,data,massage="Success"){
        this.statusCode=statusCode
        this.massage=massage
        this.data=data
        this.success=statusCode < 400
    }
}

export {ApiResponse}