# ming_mockServer用于在线Mock接口,支持js脚本与json和sql三种响应

```bash
  git clone https://github.com/minglie/ming_mockServer.git && cd ming_mockServer && cnpm i && npm run start
```


# 非打包前端
https://github.com/mucfpga/ming_mockServer_brower_front_end

# webpack打包前端
https://github.com/minglie/ming_mockServer_front_end

# bilibili
https://www.bilibili.com/video/BV1A4411m7Sx

# 微信公众号例子

```javascript
/**
* GET
* 公众号假签名校验
* @param req
* @param res
* @returns {Promise.<void>}
*/

(req,res)=>{ 
    res.send(req.params.echostr)
}


/**
* POST
* 微信自动回复
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
    let rtext=s[3]+"->感生前觉"
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
}
```
