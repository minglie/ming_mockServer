M=require("ming_node");
var app=M.server();
//基本接口
require("./controller/BaseController.js")(app);
var service=require("./service/Service");
M.database_path="static/M_database.json";
M.map_path="static/M_map.json";
M.log_path="static/M.log";
M.log_console_enable=false;//将日志输出到控制台
M.baseInterFaceurl= ["", "/", "/sseServer/","/doSql/", "/sys_server_info/add/", "/sys_server_info/update/", "/sys_server_info/reload/", "/log/clean/", "/log/set_log_enable_status/","/log/get_log_enable_status/"];

var Db = require("./service/DbService")

M.log_req_params_enable=false;
Db.display_sql_enable=false;
app.listen(8080);

sseApp=M.sseServer()
//sseApp.listen(2000)


M.console_log=console.log
console.log=function (...message) {
    M.console_log(...message);
    sseApp.send(JSON.stringify(message[0]));
}



app.begin((req,res)=>{
    //M.appendFile("./sys.log",new Date().toLocaleString()+" "+req.ip+" "+req.url+"\n");
    if(M.log_req_params_enable){
        //M.log(req.params)
    }
})

app.get("/sseServer",sseApp)


app.post("/sys_server_info/add",async function (req,res) {
    let c=await service.checkSys_server_info(req.params)
    if(c!=0){
        res.send(M.result("不可定义",false))
        return;
    }
    service.setServiceInfo(app,req);
    delete req.params.id;
    let sql=M.getInsertObjSql("sys_server_info",req.params);
    let r= await Db.doSql(sql)
    res.send(M.result(r))
})



app.post("/sys_server_info/update",async function (req,res) {
    let c=await service.checkSys_server_info(req.params)
    if(c!=0){
        res.send(M.result("不可定义",false))
        return;
    }
    service.setServiceInfo(app,req);
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




