module.exports=(M,app,Db,interfaceManageService)=>{
    
app.post("/sys_server_info/add",async function (req,res) {
    let c=await interfaceManageServicecheckSys_server_info(req.params)
    if(c!=0){
        res.send(M.result("不可定义",false))
        return;
    }
    interfaceManageServicesetServiceInfo(app,req);
    delete req.params.id;
    let sql=M.getInsertObjSql("sys_server_info",req.params);
    let r= await Db.doSql(sql)
    res.send(M.result(r))
})



app.post("/sys_server_info/update",async function (req,res) {
    let c=await interfaceManageServicecheckSys_server_info(req.params)
    if(c!=0){
        res.send(M.result("不可定义",false))
        return;
    }
    interfaceManageServicesetServiceInfo(app,req);
    let sql=M.getUpdateObjSql("sys_server_info",req.params);
    let r= await Db.doSql(sql)
    res.send(M.result(r))
})


app.get("/sys_server_info/reload",async function (req,res) {
    await  app.loadServiceInfo();
   //console.log(M._get)
    res.send(M.result("ok"))
})


//清理日志
app.get("/log/clean",async function (req,res) {
    req.params.filePath="static/"+req.params.filePath;
    let logList=["static/database.log","static/M.log","static/M_database.json","static/M_map.json"]
    if(logList.indexOf(req.params.filePath)!=-1){
        if(req.params.filePath.endsWith("json")){
            if(req.params.filePath=="static/database.log"){
                M.writeFile(req.params.filePath,"[]")
            }else {
                M.writeFile(req.params.filePath,"{}")
            }
        }else {
            M.writeFile(req.params.filePath,"")
        }
    }
    res.send(M.result("ok"))
})


app.get("/log/set_log_enable_status",async function (req,res) {
    if(req.params.type=="M_log_req_params_enable"){
        M.log_req_params_enable=req.params.value=="true"?true:false;
    }
    if(req.params.type=="Db_display_sql_enable"){
        Db.display_sql_enable=req.params.value=="true"?true:false;
    }
    res.send(M.result("ok"))
})


app.get("/log/get_log_enable_status",async function (req,res) {
   let r={M_log_req_params_enable:M.log_req_params_enable,Db_display_sql_enable:Db.display_sql_enable}
    res.send(M.result(r))
})



    
}
