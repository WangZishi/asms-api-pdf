import * as http from 'http';
import * as fs from 'fs';

const pdf = require('html-pdf');
const formBody = require('body/form');
const jsonBody = require('body/json');

const server = http.createServer(async (req, res) => {

    if (req.method === 'GET' && req.url === '/health') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok' }));
    } else if (req.method === 'POST' && req.url === '/pdf') {
        if (req.headers['content-type'] !== 'application/json' &&
            req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
            res.statusCode = 415;
            res.end();
        } else {
            let body: { html: string, options: any }, html: string, options: string,
                generatePdf = (html, options, res) => {
                    let filename = options.filename || 'render';
                    try {
                        pdf.create(html, {
                            format: 'A4'
                        }).toStream((err, stream: NodeJS.ReadableStream) => {
                            if (!!err) res.end(err);
                            else {
                                res.setHeader('Content-Type', 'application/pdf');
                                res.setHeader('Content-Disposition', `attachment;filename="${filename}.pdf"`);
                                stream.pipe(res);
                            }
                        });
                    } catch (error) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: error.message }));
                    }
                };
            if (req.headers['content-type'] === 'application/json')
                jsonBody(req, res, (err, body) => {
                    console.log({ jsonBody: body });
                    generatePdf(body.html, body.options, res);
                });
            else {
                formBody(req, res, (err, body) => {
                    body.html = `<style>
                        /* CSS Document */
                        *{margin:0;padding:0;}
                        body{color:#333;font-size:14px;font-family: "Microsoft YaHei",Tahoma,Arial,sans-serif; background:#f7f7f7;overflow-x:hidden;}
                        ul,li{list-style:none}
                        img{border:0;}
                        a:link, a:visited { color:#333;text-decoration:none;}
                        a:hover, a:active { color:#01c8a9;text-decoration:none;}
                        a{blr:expression(this.onFocus=this.blur()); /* IE Opera */ outline:none; /* FF Opera */ }
                        a:focus{ -moz-outline-style: none; /* FF */ }
                        table,td{ border-collapse:collapse;}

                        /************** bug ************/
                        .clearfix:after {content:""; display:block; height:0px; clear:both; overflow:hidden; font-size:0px; line-height:0px;}
                        .clearfix {display:inline-block;}
                        .clearfix {display:block;}
                        /************** 外边距 ************/
                        .mar5{margin:5px;}
                        .mar10{margin:10px;}
                        .mar20{margin:20px;}
                        .mar_t_10{margin-top:10px;}.mar_t_20{margin-top:20px;}.mar_t_80{margin-top:80px;}
                        .mar_r_10{margin-right:10px;}
                        .mar_l_10{margin-left:10px;}
                        .mar_b_10{margin-bottom:10px;}
                        .mar_b_010{margin-bottom:-10px!important;}
                        .mar_l_30{margin-left:30px;}
                        .mar_r_30{margin-right:30px;}
                        /************** 内边距 ************/
                        .pad10{padding:10px;}
                        .pad20{padding:20px;}
                        .pad5_r{ padding-right:5px;}
                        .pad15_r{ padding-right:15px;}
                        .pad30_r{ padding-right:30px;}
                        .pad50_l{ padding-left:50px;}
                        /************** 字号 ************/
                        .font_1{font-size:14px;}
                        .font_2{font-size:24px;}
                        /************** 行高 ************/
                        .height30{ line-height:30px;}
                        .height40{ line-height:40px;}
                        .height50{ line-height:50px;}
                        /************** 颜色 ************/
                        .color_0{color:#fff !important;}
                        .color_1{color:#bbb !important;}
                        .color_2{color:#888 !important;}
                        .color_3{color:#d75452 !important;}/*红*/
                        .color_4{color:#468cc8 !important;}/*蓝*/
                        .color_5{color:#60b761 !important;}/*绿*/
                        .color_6{color:#004a83 !important}

                        /************** 对齐 ************/
                        .floatL{float:left;}
                        .floatR{float:right}
                        .text-center{ text-align:center;}
                        .text-right{text-align:right;}
                        /************** 表单 ************/
                        .input_1{background:#fff;height:28px;line-height:28px;border:1px solid #888;width:130px;padding:0 5px; font-size:14px;font-family: "Microsoft YaHei",Tahoma,Arial,sans-serif;}
                        .underline{ text-decoration:underline; margin:0 5px;}


                        /************** 按钮 ************/
                        .button { margin:0px 10px -8px 10px; text-decoration: none; display: inline-block; text-align: center; color: #fff; border: 1px solid #9c9c9c; /* Fallback style */ border: 1px solid rgba(0, 0, 0, 0.3); }
                        .button, .button span { -moz-border-radius: .2em; border-radius: .2em; }
                        .button span { border-top: 1px solid #fff; /* Fallback style */ border-top: 1px solid rgba(255, 255, 255, 0.5); display: block; padding: 0.3em 1.5em; /* Pattern settings */ -moz-background-size: 3px 3px; -webkit-background-size: 3px 3px; background-size: 3px 3px; color: #fff;}
                        .button:hover { box-shadow: 0 0 .1em rgba(0,0,0,0.4); -moz-box-shadow: 0 0 .1em rgba(0,0,0,0.4); -webkit-box-shadow: 0 0 .1em rgba(0,0,0,0.4);color:#fff; }
                        .button:active {/* When pressed, move it down 1px */color:#fff; }
                        /*----------蓝色---------------*/
                        .button-blue { background: #468cc8;}
                        .button-blue:hover { background: #3577af;}
                        .button-blue:active { background: #316fa3;}
                        /*----------浅蓝色---------------*/
                        .button-Lblue { background: #60c0dc;}
                        .button-Lblue:hover { background: #41b4d5;}
                        .button-Lblue:active { background: #389bb8;}
                        /*----------白色--------------*/
                        .button-white { background: #fff;}
                        .button-white span{ color:#999 !important;background: #ebebeb;}
                        .button-white:hover { background: #ebebeb;}
                        .button-white:active { background: #cbcbcb;}
                        a.button-white {cursor: default;}
                        /*----------绿色---------------*/
                        .button-green { background: #60b761;}
                        .button-green:hover { background: #4ba34c;}
                        .button-green:active { background: #428739; }
                        /*-----------红色--------------*/
                        .button-red { background: #d75452;}
                        .button-red:hover { background: #d03433;}
                        .button-red:active { background: #b42d2c; }
                        /*------------橘色-------------*/
                        .button-orange { background: #efad57; }
                        .button-orange:hover { background: #eb9b37;}
                        .button-orange:active { background: #cb862f; }


                        /************** 标题 ************/
                        .T-title{ font-size:16px; font-weight:bold; padding-bottom:5px;margin-bottom:10px;border-bottom: 1px dotted #888; margin-top:20px; position:relative;}
                        /************** 当前位置 ************/
                        .position{ background:#f1f1f1 url(../images/icon_position.png) no-repeat 10px center;}

                        .line{ height:1px; background:#888;margin:10px 0px;}
                        .bordertop1{ border-top:1px dotted #ddd;}
                        .floatR_btn{position: absolute;bottom:10px; right: 0px;}

                        /*表格*/
                        .resultTable td{ border:1px solid #888;padding:0 10px; text-align:center;}
                        .resultTable th{ background:#56627f; color:#fff; border:1px solid #000;}

                    </style>` + decodeURIComponent(body.html);
                    body.options = JSON.parse(body.options);
                    console.log({ formOptions: body.options });
                    generatePdf(body.html, body.options, res);
                });
            }
        }
    } else {
        res.statusCode = 404;
        res.end();
    }
});
server.listen(3000);
console.log('Listening on port 3000...');