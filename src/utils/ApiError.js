//Node js give us a Error class to handle diffrent types of error

class ApiError extends Error{
    constructor(
        statusCode,
        massage ="Something Went Wrong",
        errors=[],
        stack=""
    ){
        super(massage) // override massage from Error class
        //override
        this.statusCode=statusCode
        this.data=null
        this.message=massage
        this.success=false;
        this.errors=errors

        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}