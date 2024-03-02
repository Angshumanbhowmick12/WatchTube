// asyncHandler is a higher order function
// higher order function is funtion accept as a parameter or return 
// const asyncHandler=(func)=> async ()=>{}

const asyncHandler=(requestHandler)=>{
   return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next))
        .catch((err)=>next(err))
    }  // it's a higher order funtion it's need to be return as funtion
}

export {asyncHandler}



// const asyncHandler=(fn)=>async(req,res,next)=>{
//       try {
//         await fn(req,res,next)
//       } catch (error) {
//          res.status(error.code || 500).json({
//             success:false,
//             massage:error.massage
//          })
//       }
// }