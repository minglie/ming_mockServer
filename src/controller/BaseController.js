var Db = require("../service/DbService");

module.exports=(app)=>{
    //加载库中接口
    app.loadServiceInfo=async function () {
        //清空现有接口
        let mgetKey= Object.keys(M._get)
        for(let i=0;i<mgetKey.length;i++){
            if(M.baseInterFaceurl.indexOf(mgetKey[i])==-1){
                delete M._get[mgetKey[i]]
            }
        }
        let mpostKey= Object.keys(M._post)
        for(let i=0;i<mpostKey.length;i++){
            if(M.baseInterFaceurl.indexOf(mpostKey[i])==-1){
                delete M._post[mpostKey[i]]
            }
        }

        let sql=`select * from sys_server_info`;
        let rList=await Db.doSql(sql)
        for (let i=0;i<rList.length;i++){
            let r=rList[i];
            if("json"==r.resultType){
                app[r.method](r.path,async (req,res)=>{res.send(r.functionBody)})
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
    }

    app.loadServiceInfo();


    app.get("/",async function (req,res) {
        app.redirect("/index.html#/A",req,res);
    });

    app.post("/doSql",async function (req,res) {
        try{
             let sql=req.params.sql
             var rows= await Db.doSql(req.params.sql);
             res.send(M.result(rows));
        }catch (e){
            res.send(M.result(e,false));
        }
    })

}

