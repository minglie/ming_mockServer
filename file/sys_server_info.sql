/*Thu Jul 11 2019 23:03:03 GMT+0800 (中国标准时间)*/


CREATE TABLE sys_server_info (
    id           INTEGER       NOT NULL AUTO_INCREMENT,
    name         VARCHAR (200) DEFAULT NULL,
    path         VARCHAR (200) DEFAULT NULL,
    method       VARCHAR (200) DEFAULT NULL,
    resultType   VARCHAR (200) DEFAULT NULL,
    functionBody VARCHAR (200) DEFAULT NULL,
    PRIMARY KEY (
        id
    )
);


insert into sys_server_info(id,name,path,method,resultType,functionBody) values ('6','公众号假签名校验','/minglie/wechat','get','javascript','/**
 * 简化,不校验了
 */
(req,res)=>{ res.send(req.params.echostr) }
');
insert into sys_server_info(id,name,path,method,resultType,functionBody) values ('7','回复公众号消息','/minglie/wechat','post','javascript','
/**
 * 接收文本消息
<xml>
        <ToUserName><![CDATA[公众号]]></ToUserName>
        <FromUserName><![CDATA[粉丝号]]></FromUserName>
        <CreateTime>1460537339</CreateTime>
        <MsgType><![CDATA[text]]></MsgType>
        <Content><![CDATA[欢迎开启公众号开发者模式]]></Content>
        <MsgId>6272960105994287618</MsgId>
</xml>
回复的消息
<xml>
    <ToUserName><![CDATA[粉丝号]]></ToUserName>
    <FromUserName><![CDATA[公众号]]></FromUserName>
    <CreateTime>1460541339</CreateTime>
    <MsgType><![CDATA[text]]></MsgType>
    <Content><![CDATA[test]]></Content>
</xml>
 */

async (req,res)=>{
    //用正则解析接收的文本消息
    s=req.body.match(/!\[CDATA\[(.+)\]\]/g).map(d=>{return d.replace(/(\]{2})|(!\[CDATA\[)/g,"")})
    let rtext=s[3]+",我确信js是最好的语言"
    r=`
        <xml>
            <ToUserName><![CDATA[${s[1]}]]></ToUserName>
            <FromUserName><![CDATA[${s[0]}]]></FromUserName>
            <CreateTime>${new Date().getTime()}</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[${rtext}]]></Content>
            </xml>
        `
    res.send(r)
}');
insert into sys_server_info(id,name,path,method,resultType,functionBody) values ('8','查寻所有账号','/account/listAll','get','javascript','async (req,res)=>{
    let r= await Db.doSql("select * from accout")
    res.send(M.result(r))
}');
