//20190811

(function (window, undefined) {

    var M = {};

    M.init_server_enable=true;
    M.host = "";
    M.map_path="map_path";
    M.database_path="database_path";

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        try {
            $=require("jquery");
        }catch (e) {
            delete $;
        }
    }
    if(typeof $=="undefined"){
        window.$={};
        window.$.ajax=function(options){
            options.beforeSend()
        }
    }
    
    var App = {
        reqMap: new Map(),
        resMap: new Map(),

        // 缓存ajax方法
        ajax: $.ajax,
        _get: {},
        _post: {},
        _begin: function () {
        },
        _end: function () {
        },

        begin(callback) {
            App._begin = callback;
        },
        end(callback) {
            App._end = callback;
        },
        /**
         * 注册get方法
         */
        get (string, callback) {
            //在M.IO上注册一个方法
            M.IO.reg(string.replace("/", ""), "get");
            string = M.formatUrl(string);
            App._get[string] = callback;
        },
        /**
         * 注册post方法
         */
        post(string, callback) {
            M.IO.reg(string.replace("/", ""), "post");
            string = M.formatUrl(string);
            App._post[string] = callback;
        },
        doget(pureUrl, options) {
            req = {};
            res = {};
            req.params = App.reqMap.get("get:" + pureUrl);
            req.method = "get";
            req.pureUrl = pureUrl;
            if (Object.keys(req.params).length) {
                req.url = pureUrl.substr(0, pureUrl.length - 1) + "?" + M.urlStringify(req.params);
            } else {
                req.url = pureUrl;
            }
            res.send = function (d) {
                this.resMap.set("get:" + pureUrl, d);
                data = App.resMap.get(options.type + ":" + pureUrl);
                App._end(data);
                options.success(data);
            }.bind(this);
            App._begin(req);
            App._get[pureUrl](req, res);
        },
        dopost(pureUrl, options) {
            req = {};
            res = {};
            req.params = App.reqMap.get("post:" + pureUrl);
            req.method = "post";
            req.pureUrl = pureUrl;
            req.url = pureUrl;
            res.send = function (d) {
                this.resMap.set("post:" + pureUrl, d);
                data = App.resMap.get(options.type + ":" + pureUrl);
                App._end(data);
                options.success(data);
            }.bind(this);
            App._begin(req, res);
            App._post[pureUrl](req, res);
        }
    };


    /**
     * ----------------------其他工具函数START--------------------------------------------
     */
    M.sleep = function (numberMillis) {
        var now = new Date();
        var exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    };

    /**
     * ----------------------服务器端START--------------------------------------------
     */
    M.get = function (url, param) {
        let u;
        M.ajax({
            url: url,
            async: false,
            type: 'get',
            data: param,
            dataType: 'json',
            success: function (data) {
                u = data;
            }
        });
        return u;
    };


    M.post = function (url, param) {
        let u;
        M.ajax({
            url: url,
            async: false,
            type: 'post',
            data: param,
            dataType: 'json',
            success: function (data) {
                u = data;
            }
        });
        return u;
    };


    M.result = function (data, success) {
        var r = {};
        if (success == false) {
            r.code = 3003;
            r.message = "操作失败";
            r.success = success;
        } else {
            r.code = 3002;
            r.message = "操作成功";
            r.success = true;
        }
        try {
            var obj = JSON.parse(data);
            if (typeof obj == 'object' && obj) {
                r.data = obj;
            } else {
                r.data = data;
            }
        } catch (e) {
            r.data = data;
        }
        return r;
    };

    /**
     *获取下划线式的对象
     */
    M.getUnderlineObj=function (obj) {
        var result={};
        for(let field in obj){
            result[field.humpToUnderline()]=obj[field]
        }
        return result;
    };

    /**
     *获取驼峰式的对象
     */
    M.getHumpObj=function (obj) {
        var result={};
        for(let field in obj){
            result[field.underlineToHump()]=obj[field]
        }
        return result;
    };

    M.randomStr=function () {
        return  (Math.random().toString(36)+new Date().getTime()).slice(2);
    };


    M.urlStringify = function (obj) {
        if (obj !== null && typeof obj === 'object') {
            var keys = Object.keys(obj);
            var len = keys.length;
            var flast = len - 1;
            var fields = '';
            for (var i = 0; i < len; ++i) {
                var k = keys[i];
                var v = obj[k];
                var ks = k + "=";
                fields += ks + v;
                if (i < flast)
                    fields += "&";
            }
            return fields;
        }
        return '';
    };

    M.urlParse = function (url) {
        url = url.substr(url.indexOf("?") + 1);
        var t, n, r, i = url, s = {};
        t = i.split("&"),
            r = null,
            n = null;
        for (var o in t) {
            var u = t[o].indexOf("=");
            u !== -1 && (r = t[o].substr(0, u),
                n = t[o].substr(u + 1),
                s[r] = n)
        }
        return s
    };

    /**
     * 去掉参数加让斜杠
     */
    M.formatUrl = function (url) {
        if (url.indexOf("?") > 0) {
            url = url.substr(0, url.indexOf("?"));
        } else {
            url = url;
        }
        if (!url.endsWith('/')) {
            url = url + '/';
        }
        if (!url.startsWith('/')) {
            url = '/' + url;
        }
        return url;
    };


    M.encodeURIComponentObj = function (data) {
        let ret = '';
        for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
        }
        return ret
    };

    M.fetchGet = function (url, callback, data) {
        var getData = "";
        if (data) {
            getData = M.urlStringify(data);
            if (url.indexOf("?") > 0) {
                getData = "&" + getData;
            } else {
                getData = "?" + getData;
            }
        }
        url = M.host + url + getData;
        fetch(url, {
                method: 'GET',
                mode: 'cors'
            }
        ).then((res) => {
            return res.json()
        }).then((res) => callback(res)).catch((error) => {
            console.error(error)
        });
    };

    M.fetchPost = function (url, callback, data) {
        fetch(M.host + url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: M.encodeURIComponentObj(data)
        }).then(function (response) {
            return response.json();
        }).then((resonseData) => {
            callback(resonseData);
        })
            .catch((error) => {
                console.error(error)
            });
    };


    M.doSql = function (sql, callback) {
        fetch(M.host + '/doSql', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: M.encodeURIComponentObj({sql})
        }).then(function (response) {
            return response.json();
        }).then((resonseData) => {
            if(callback){
                callback(resonseData);
            }
        })
            .catch((error) => {
                console.error(error)
            });
    };


    M.axiosDoSql = function (sql, callback) {
        axios({
            url: M.host + '/doSql',
            method: 'post',
            data: {
                sql
            },
            transformRequest: [function (data) {
                let ret = '';
                for (let it in data) {
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                return ret
            }],
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (response) {
            callback(response.data);
        })
            .catch(function (error) {
                console.err(error);
            });
    };


    M.getObjByFile = function (file) {
        data = localStorage.getItem(file)||"[]";
        var obj;
        if (data) obj = JSON.parse(data.toString());
        return obj;
    };
    M.writeObjToFile = function (file, obj) {
        localStorage.setItem(file, JSON.stringify(obj))
    };

    M.addObjToFile = function (file, obj) {
        try {
            var d = M.getObjByFile(file);
            M.writeObjToFile(file, [...d, obj]);
        } catch (e) {
            M.writeObjToFile(file, [obj]);
        }
    };
    M.deleteObjByIdFile=function(file,id){
        let ids=[];
        if(!Array.isArray(id)){
            ids.push(id)
        }else {
            ids=id;
        }
        var d=M.getObjByFile(file);
        var d1=M.getObjByFile(file);
        let d_num=0;
        for(let i=0;i<d1.length;i++){
            if(ids.indexOf(d1[i].id)>=0){
                d.splice(i-d_num,1);
                d_num++;
                if(ids.length==1)break;
            }
        }
        M.writeObjToFile(file,d);
    };

    M.deleteObjByPropFile=function(file,o){
        let o_key=Object.keys(o)[0];
        let o_val=o[o_key];
        var d=M.getObjByFile(file);
        var d1=M.getObjByFile(file);
        let d_num=0;
        for(let i=0;i<d1.length;i++){
            if(d1[i][o_key]==o_val){
                d.splice(i-d_num,1);
                d_num++;
            }
        }
        M.writeObjToFile(file,d);
    };

    M.updateObjByIdFile = function (file, obj) {
        var d = M.getObjByFile(file);
        for (var i = 0; i < d.length; i++) {
            if (d[i].id == obj.id) {
                d.splice(i, 1, obj);
                break;
            }
        }
        M.writeObjToFile(file, d);
    };

    M.getObjByIdFile=function(file,id){
        var d=M.getObjByFile(file);
        for(let i=0;i<d.length;i++){
            if(d[i].id==id){
                return d[i];
            }
        }
    };

    M.listAllObjByPropFile=function(file,o){
        let r_list=[];
        let o_key=Object.keys(o)[0];
        let o_val=o[o_key];
        var d=M.getObjByFile(file);
        for(let i=0;i<d.length;i++){
            if(d[i][o_key]==o_val){
                r_list.push(d[i]);
            }
        }
        return r_list;
    };


    /**
     * 文件型数据库第二层封装
     */
    M.add=function (obj) {
        obj.id=M.randomStr();
        M.addObjToFile(M.database_path,obj);
        return obj;
    };
    M.update=function (obj) {
        M.updateObjByIdFile(M.database_path,obj);
    };
    M.deleteById=function (id) {
        M.deleteObjByIdFile(M.database_path,id);
    };
    /**
     * 清空所有
     */
    M.deleteAll=function (o) {
        if(o){
            M.deleteObjByPropFile(M.database_path,o);
        }else {
            M.writeObjToFile(M.database_path,[]);
        }
    };
    /**
     * 根据属性删
     * @param o
     */
    M.deleteByProp=function (o) {
        M.deleteObjByPropFile(M.database_path,o);
    };
    /**
     * 根据id删
     * @param id
     */
    M.getById=function (id) {
        return M.getObjByIdFile(M.database_path,id);
    };
    /**
     * 查寻所有
     */
    M.listAll=function (o) {
        if(o){
            return M.listAllObjByPropFile(M.database_path,o);
        }else {
            return M.getObjByFile(M.database_path);
        }
    };
    /**
     * 根据属性查询
     * @param o
     */
    M.listByProp=function (o) {
        return M.listAllObjByPropFile(M.database_path,o);
    };
    /**
     *分页查询
     */
    M.listByPage=function (startPage,limit,caseObj) {
        if(startPage<=0)startPage=1;
        let rows;
        if(caseObj){
            rows=M.listByProp(caseObj);
        }else {
            rows= M.listAll();
        }
        let total=rows.length;
        rows=rows.splice((startPage-1)*limit,limit);
        return {rows,total}
    };


    /**
     * 全局作用域
     * @param k
     * @param v
     */
    M.setAttribute=function (k,v) {
        let a={};
        a[k]=v;
        a=JSON.stringify(a);
        a=JSON.parse(a);
        let preObj;
        try{
            preObj=M.getObjByFile(M.map_path)||{};
            if(Array.isArray(preObj))preObj={};
        }catch(e){
            preObj={};
        }

        M.writeObjToFile(M.map_path,Object.assign(preObj,a));
    };

    M.getAttribute=function (k) {
        return M.getObjByFile(M.map_path)[k];
    };




    M.fileDownload = function (content, filename) {
        var eleLink = document.createElement('a');
        eleLink.download = filename;
        eleLink.style.display = 'none';
        var blob = new Blob([content]);
        eleLink.href = URL.createObjectURL(blob);
        document.body.appendChild(eleLink);
        eleLink.click();
        document.body.removeChild(eleLink);
    };


    //获取地址栏数据
    M.getParameter = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.href.substr(window.location.href.indexOf('?')).substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };
    //说话函数
    M.speak = function (speakStr) {
        var myAudio = document.createElement("AUDIO");
        myAudio.src = "http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=9&text=" + speakStr;
        myAudio.type = "audio/mpeg";
        myAudio.play();
    };

    /**
     *改写ajax方法
     */
    M.ajax = function (options) {
        d = M.urlParse(options.url);
        options.data = Object.assign(d, options.data);
        App.ajax({
            url: options.url,
            beforeSend(XHR) {
                let pureUrl = M.formatUrl(options.url);
                //往reqMap里加数据
                App.reqMap.set(options.type + ":" + pureUrl, options.data);

                if (options.type == "get") {
                    App.doget(pureUrl, options);
                } else {
                    App.dopost(pureUrl, options);
                }


                return false;
            },
            success(data) {

                options.success(data)
            }
        })
    };


    //服务方法注册
    M.IO = {};
    M.IO.reg = function (methed, type) {
        M.IO[methed] = (param) => {
            return new Promise(
                function (reslove) {
                    M.ajax({
                        url: "/" + methed,
                        data: param,
                        type: type,
                        success: function (data) {
                            reslove(data)
                        }
                    });
                }
            )
        }
    };


    M.EventSource=function (url,callback) {
        if (window.EventSource) {
            // 创建 EventSource 对象连接服务器
            const source = new EventSource(url);
            // 连接成功后会触发 open 事件
            source.addEventListener('open', () => {
                console.log('Connected');
            }, false);
            // 服务器发送信息到客户端时，如果没有 event 字段，默认会触发 message 事件
            source.addEventListener('message', e => {
                console.log(`data: ${e.data}`);
            }, false);
            // 自定义 EventHandler，在收到 event 字段为 slide 的消息时触发
            source.addEventListener('slide', e => {
               callback(e);
            }, false);
            // 连接异常时会触发 error 事件并自动重连
            source.addEventListener('error', e => {
                if (e.target.readyState === EventSource.CLOSED) {
                    console.log('Disconnected');
                } else if (e.target.readyState === EventSource.CONNECTING) {
                    console.log('Connecting...');
                }
            }, false);
            return source;
        } else {
            console.error('Your browser doesn\'t support SSE');
        }

    };


    M.Db = function (dbname) {
        var Db = {};
        Db.display_sql_enable = false;

        Db = openDatabase(dbname, '1.0', '', 2 * 1024 * 1024);

        Db.getInsertObjSql = function (tableName, obj) {
            var fields = "(";
            var values = "(";
            for (let field in obj) {
                fields += field + ",";
                values += `'${obj[field]}'` + ",";
            }
            fields = fields.substr(0, fields.lastIndexOf(","));
            values = values.substr(0, values.lastIndexOf(","));
            fields += ")";
            values += ")";
            let sql = "insert into " + tableName + fields + " values " + values;
            return sql;
        };

        Db.getDeleteObjSql = function (tableName, obj) {
            var fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `delete from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };

        Db.getUpdateObjSql = function (tableName, obj, caseObj) {
            var fields = [];
            for (let field in obj) {
                if (field != "id")
                    fields.push(field);
            }
            let sql = "";
            if (!caseObj) {
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where id=${obj.id}`;
            } else {
                var caseObjfields = [];
                for (let caseObjfield in caseObj) {
                    caseObjfields.push(caseObjfield)
                }
                sql = `update ${tableName} set ${fields.map(u => u + "='" + obj[u] + "'")} where ${caseObjfields.map(u => u + "='" + caseObj[u] + "'").join(" and ")}`;
            }

            return sql;
        };


        Db.getSelectObjSql = function (tableName, obj) {
            var fields = [];
            for (let field in obj) {
                fields.push(field);
            }
            let sql = `select * from ${tableName} where ${fields.map(u => u + "='" + obj[u] + "'")}`;
            sql = sql.replace(/,/g, " and ");
            return sql;
        };


        Db.doSql = function (sql) {
            if (Db.display_sql_enable) console.log(sql + ";");
            var promise = new Promise(function (reslove, reject) {
                Db.transaction(function (context) {
                    context.executeSql(sql, [], function (context, results) {
                        reslove(results);
                    });
                }, function (error) {
                    reject(error);
                    console.error(error.message);
                }, function (a) {
                    console.log(a)
                });

            });
            return promise;
        };
        return Db;
    };


    M.init = function () {
        /***
         * 下划线命名转为驼峰命名
         */
        String.prototype.underlineToHump = function () {
            var re = /_(\w)/g;
            str = this.replace(re, function ($0, $1) {
                return $1.toUpperCase();
            });
            return str;
        };

        /***
         * 驼峰命名转下划线
         */
        String.prototype.humpToUnderline = function () {
            var re = /_(\w)/g;
            str = this.replace(/([A-Z])/g, "_$1").toLowerCase();
            return str;
        };

        //首字母变大写
        String.prototype.firstChartoUpper = function () {
            return this.replace(/^([a-z])/g, function (word) {
                return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
            });
        };
        //首字母变小写
        String.prototype.firstChartoLower = function () {
            return this.replace(/^([A-Z])/g, function (word) {
                return word.replace(word.charAt(0), word.charAt(0).toLowerCase());
            });
        };
        //格式化日期
        Date.prototype.format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1,                 //月份
                "d+": this.getDate(),                    //日
                "h+": this.getHours(),                   //小时
                "m+": this.getMinutes(),                 //分
                "s+": this.getSeconds(),                 //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds()             //毫秒
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        }
    };
    M.initServer=function () {
        app.post("/add",(req,res)=>{
            r=M.add(req.params);
            res.send(M.result(r));
        });

        app.get("/delete",(req,res)=>{
            M.deleteById(req.params.id);
            res.send(M.result("ok"));
        });

        app.post("/update",(req,res)=>{
            M.update(req.params);
            res.send(M.result("ok"));
        });

        app.get("/getById",(req,res)=>{
            r=M.getById(req.params.id);
            res.send(M.result(r));
        });

        app.get("/listAll",(req,res)=>{
            r=M.listAll();
            res.send(M.result(r));
        });

        app.get("/listByParentId",(req,res)=>{
            r=M.listByProp({parentId:req.params.parentId});
            res.send(M.result(r));
        });

        app.get("/listByPage",(req,res)=>{
            r=M.listByPage(req.params.startPage,req.params.limit);
            res.send(M.result(r));
        })
    };

    M.init();
    window.app = App;
    window.M = M;
    window.MIO=M.IO;
    $.ajax = M.ajax;
    if(M.init_server_enable)M.initServer();


    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = {app:App,M,MIO:M.IO}
    }


})(window);