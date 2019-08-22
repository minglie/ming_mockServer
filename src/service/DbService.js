var M=require("ming_node");
var SQLite3 = require('sqlite3').verbose();
var Db = new SQLite3.Database("./service/student.db");


Db.doSql=function doSql(sql){
    var promise = new Promise(function(reslove,reject){
        if(Db.display_sql_enable) {
            M.log_path="static/database.log";
            M.log(sql+";")
            M.log_path="static/M.log";
        }

        if(sql.indexOf("select")>-1){
            Db.all(sql,
                function(err, result) {
                    if (err) {
                        M.log(err);
                        reject(err);
                    } else {
                        reslove(result);
                    }
                });
        }else{
            Db.run(sql,
                function(err) {
                    if(err){
                        // M.log(err);
                        reject(err);
                    }
                    reslove(null);
                });
        }
    })
    return promise;
}


module.exports=Db;