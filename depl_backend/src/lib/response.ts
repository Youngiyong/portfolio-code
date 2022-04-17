
export const DeplMsgResponse = (statusCode: number, msg: string) =>{
    return {
        statusCode: statusCode,
        body: JSON.stringify({ message : msg }),
    }
}


export const DeplResponse = (statusCode: number, data: {}) =>{
    return {
        statusCode: statusCode,
        body: JSON.stringify({ data : data }),
    }
}
