const M=require("ming_node");
const app=M.server();
//基本接口
const Db = require("./service/DbService");
const interfaceManageService=require("./service/InterfaceManageService");

require("./controller/BaseController.js")(M,Db,app);
require("./controller/InterfaceManageeController.js")(M,app,Db,interfaceManageService);



app.listen(8080);




