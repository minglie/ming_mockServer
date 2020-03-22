var Db = require("./DbService")

const M=require("ming_node");

service={}


service.setServiceInfo=async function (app,req) {
    let r=req.params;
    if("json"==r.resultType){
        app[r.method](r.path,(req,res)=>{res.send(r.functionBody)})
    }else if("javascript"==r.resultType){
        app[r.method](r.path,eval(r.functionBody))
    }else if("mysql"==r.resultType){
        app[r.method](r.path,async (req,res)=>{
            let sql1= r.functionBody.replace("\t","");
            sql1="`"+sql1+"`";
            let  r1=await Db.doSql(eval(sql1));
            res.send(M.result(r1));
        })
    }
}


service.checkSys_server_info=async function (params) {
    let {name,path,id,method}=params;
    let path1=M.formatUrl(path)
    if(M.baseInterFaceurl.indexOf(path1)>0 ||!path1.startsWith("/") || path1=="" || path1=="/") {
        return 1
    }
    let sql=`select count(1) c from sys_server_info
    where (method='${method}' and path='${path}' or name='${name}')`
    if(id){
        sql=sql+`and id!=${id}`
    }
    let r=await Db.doSql(sql);
    //console.log(r)
    if(r[0].c==0){
        return 0;
    }else {
        return 1;
    }
}


module.exports=service;