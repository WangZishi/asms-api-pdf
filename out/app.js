"use strict";
const http = require('http');
const pdf = require('html-pdf');
const formBody = require('body/form');
const jsonBody = require('body/json');
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/v2/pdf/health') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok' }));
    }
    else if (req.method === 'POST' && req.url === '/api/v2/pdf') {
        if (req.headers['content-type'] !== 'application/json' &&
            req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
            res.statusCode = 415;
            res.end();
        }
        else {
            let body, html, options, generatePdf = (html, options, res) => {
                let filename = options.filename || 'render';
                try {
                    // console.log({ filename, html });
                    pdf.create(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>申请表</title>
                    <style type="text/css">
                        body {
                            font: 12px/1.5 "SimSun";
                        }
                        * {
                            -webkit-box-sizing: border-box;
                            -moz-box-sizing: border-box;
                                    box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        .clearfix:before,.clearfix:after {
                            content: "";
                            display: table;
                        }
                        .clearfix:after {
                            clear: both;
                            overflow: hidden;
                        }
                        table {
                            border-collapse: collapse;
                            border-spacing: 0;
                        }
                        img {
                            width: 100%;
                            height: 100%;
                            display: block;
                        }
                        .wrapBox {
                            height: 283mm;
                            width: 190mm;
                            page-break-after: always;
                            margin: 10mm auto 4mm;
                            overflow: hidden;
                            position: relative;
                        }
                        .wrapTitle {
                            font-size: 22px;
                            text-align: center;
                            letter-spacing: 2pt;
                            margin: 2mm 0 5mm;
                        }
                        .itemTitle {
                            color: #005ABB;
                            font-style: italic;
                            text-decoration: underline;
                            margin: 1mm 0;
                        }
                        .cell {
                            border: 1px solid #000;
                            padding-left: 3px;
                            margin: 0 2mm 1.5mm 0;
                            float: left;
                        }
                        .cell p {
                            line-height: 17px;
                            height: 17px;
                        }
                        .wrapTop{
                            margin-top: 12mm;
                            height: 25mm;
                        }
                        .wrapTop .logo {
                            float: left;
                            width: 22mm;
                            margin: 2mm 2mm 0 5mm;
                        }
                        .wrapTop .spec {
                            width: 75mm;
                            float: left;
                            padding-top: 8px;
                        }
                        .wrapTop .spec p {
                            line-height: 1.1;
                            text-align: center;
                            font-size: 9px;
                            letter-spacing: -0.1mm;
                        }
                        .wrapTop .spec p.fz13 {
                            font-size: 12px;
                            letter-spacing: 0;
                        }
                        .wrapTop .spec p.fz17 {
                            font-size: 15px;
                            letter-spacing: 0;
                        }
                        .topTable {
                            border: 1px solid #000;
                            width: 73mm;
                            margin-left: 5mm;
                        }
                        .topTable td {
                            border: 1px solid #000;
                            padding-left: 5px;
                            height: 16px;
                            font-size: 10px;
                        }
                        .w44 {
                            width: 44mm;
                        }
                        .w96 {
                            width: 96mm;
                        }
                        .w70 {
                            width: 70mm;
                        }
                        .w32 {
                            width: 32mm;
                        }
                        .w36 {
                            width: 36mm;
                        }
                        .w190 {
                            width: 188mm;
                        }
                        .w116 {
                            width: 116mm;
                        }
                        .w142 {
                            width: 142mm;
                        }
                        .w55 {
                            width: 55mm;
                        }
                        .w85 {
                            width: 85mm;
                        }
                        .w131 {
                            width: 131mm;
                        }
                        .footer {
                            text-align: center; 
                            position: absolute; 
                            bottom: 2mm; 
                            left: 0; 
                            right: 0;
                            border-top: 1px solid #000;
                            padding-top: 3mm;
                        }
                        .footer span:last-child, .footer span:first-child {
                            position: absolute; 
                            top: 3mm;
                        }
                    </style>
                </head>
                <body>
                    <div class="wrapBox">
                        <div class="innerBox">
                            <div class="wrapTop clearfix">
                                <div class="logo">
                                    <img src="data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAA8AAD/4QMraHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjMtYzAxMSA2Ni4xNDU2NjEsIDIwMTIvMDIvMDYtMTQ6NTY6MjcgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI4RjNBQjY2MjZENDExRTY5MDcyQUM0QjQxRUEyRjI3IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI4RjNBQjY1MjZENDExRTY5MDcyQUM0QjQxRUEyRjI3IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzYgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5kaWQ6OUZCOThBMDNENDI2RTYxMThENUFFNDZENDgwMjBBRUQiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OUZCOThBMDNENDI2RTYxMThENUFFNDZENDgwMjBBRUQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAAGBAQEBQQGBQUGCQYFBgkLCAYG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">
                                </div>
                                <div class="spec">
                                    <p class="fz13">中国国家留学生基金管理委员会</p>
                                    <p class="fz17">CHINA SCHOLARSHIP COUNCIL</p>
                                    <p>中国 北京西城区车公庄大街9号A3楼13层 100044</p>
                                    <p>Level 13, Building A3, No.9 Chegongzhuang Avense Beijing</p>
                                    <p>100044 P.R China</p>
                                    <p>Tel:0086-10-66093900&nbsp;&nbsp;E-mail:laihua@csc.edu.cn</p>
                                    <p>Fax:0086-10-66093915&nbsp;&nbsp;Http://www.csc.edu.cn</p>
                                </div>
                                <table class="topTable">
                                    <colgroup>
                                        <col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%"><col width="7.6%">
                                    </colgroup>
                                    <tbody>
                                        <tr style="text-align: center;">
                                            <td colspan="3">CSC NO.</td>
                                            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                        </tr>
                                        <tr>
                                            <td colspan="6">派遣类别：</td>
                                            <td colspan="7">学生类别：</td>
                                        </tr>
                                        <tr>
                                            <td colspan="6">经费办法：</td>
                                            <td colspan="7">学习专业：</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p style="text-align: right; padding-right: 30mm; font-size: 9px;">( The above table is only for CSC )</p>
                            <h1 class="wrapTitle">中国政府奖学金申请表</h1>
                            <div class="itemBox">
                                <h2 class="itemTitle">个人基本信息：</h2>
                                <div class="clearfix">
                                    <div style="float: left; width: 144mm;" class="clearfix">
                                        <div class="cell w44">
                                            <p>受理机构编号 - (必填)</p>
                                            <p>8405</p>
                                        </div>
                                        <div class="cell w96">
                                            <p>受理机构名称 - (必填)</p>
                                            <p>驻旧金山总领馆</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>姓氏 - (必填)</p>
                                            <p>Green</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>名字 - (必填)</p>
                                            <p>aaaaabcc</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>中文姓名 - (必填)</p>
                                            <p>中文姓名</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>性别 - (必填)</p>
                                            <p>男</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>出生日期 - (必填)</p>
                                            <p>2016-06-05</p>
                                        </div>
                                        <div class="cell w70">
                                            <p>婚姻状况 - (必填)</p>
                                            <p>其他</p>
                                        </div>
                                    </div>
                                    <div style="height: 42mm;" class="cell w44">
                                        <img src="" alt="">
                                    </div>
                                    <div class="cell w70">
                                        <p>国籍 - (必填)</p>
                                        <p>马绍尔群岛</p>
                                    </div>
                                    <div class="cell w36">
                                        <p>母语 - (必填)</p>
                                        <p>德语</p>
                                    </div>
                                    <div class="cell w32">
                                        <p>护照号码</p>
                                        <p>12345678</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>护照有效期</p>
                                        <p>2016-06-05</p>
                                    </div>
                                    <div class="cell w70">
                                        <p>出生地点/国家 - (必填)</p>
                                        <p>美国</p>
                                    </div>
                                    <div class="cell w70">
                                        <p>出生地点/城市 - (必填)</p>
                                        <p>洛杉矶</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>宗教</p>
                                        <p>11</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>永久联系电话 - (必填)</p>
                                        <p>12</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>永久联系传真</p>
                                        <p>46543</p>
                                    </div>
                                    <div class="cell w96">
                                        <p>永久联系E-mail - (必填)</p>
                                        <p>35425453</p>
                                    </div>
                                    <div class="cell w190">
                                        <p>永久联系地址 - (必填)</p>
                                        <p>beijing</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>当前联系电话</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>当前联系传真</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w96">
                                        <p>当前联系E-mail - (自动关联申请账户邮箱，可编辑)</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>当前联系地址</p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                            <div class="itemBox">
                                <h2 class="itemTitle">受教育情况及工作经历：</h2>
                                <h3 style="font-size: 14px; padding-left: 5px; font-weight: normal; margin: 8px 0 4px;">最高学历</h3>
                                <div class="clearfix">
                                    <div class="cell w190">
                                        <p>学校 - (必填)</p>
                                        <p>school7</p>
                                    </div>
                                    <div class="cell w70">
                                        <p>在校时间 - (必填)</p>
                                        <p>2016-06-05 -- 2016-06-07</p>
                                    </div>
                                    <div class="cell w116">
                                        <p>主修专业</p>
                                        <p>major1</p>
                                    </div>
                                    <div class="cell w190">
                                        <p>毕业证书及学位证书类别 - (必填)</p>
                                        <p>certifcate1</p>
                                    </div>
                                </div>
                                <h3 style="font-size: 14px; padding-left: 5px; font-weight: normal; margin: 8px 0 4px;">其他学历Ⅰ</h3>
                                <div class="clearfix">
                                    <div class="cell w190">
                                        <p>学校</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w70">
                                        <p>在校时间</p>
                                        <p>2016-06-23 -- 2016-06-05</p>
                                    </div>
                                    <div class="cell w116">
                                        <p>主修专业</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>毕业证书及学位证书类别</p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>	
                        </div>
                        <div class="footer">
                            <span style="left: 1.5mm;">流水号: 131c25e00604af35bf30af4f45cf744c</span>
                            <span>第1页，共3页</span>
                            <span style="right: 1.5mm;">生成日期: 2016-06-28</span>
                        </div>
                    </div>
                    <div class="wrapBox">
                        <div class="innerBox">
                            <div class="itemBox">
                                <h3 style="font-size: 14px; padding-left: 5px; font-weight: normal; margin: 8px 0 4px;">其他学历Ⅱ</h3>
                                <div class="clearfix">
                                    <div class="cell w190">
                                        <p>学校</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w70">
                                        <p>在校时间</p>
                                        <p>2016-06-05 -- 2016-06-05</p>
                                    </div>
                                    <div class="cell w116">
                                        <p>主修专业</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>毕业证书及学位证书类别</p>
                                        <p></p>
                                    </div>
                                </div>
                                <h3 style="font-size: 14px; padding-left: 5px; font-weight: normal; margin: 8px 0 4px;">来华前工作单位</h3>
                                <div class="clearfix">
                                    <div class="cell w190">
                                        <p>工作单位</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w70">
                                        <p>起止时间</p>
                                        <p>2016-06-05 -- 2016-06-05</p>
                                    </div>
                                    <div class="cell w116">
                                        <p>从事工作</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>职务及职称</p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                            <div class="itemBox">
                                <h2 class="itemTitle">语言能力及学习计划：</h2>
                                <div class="clearfix">
                                    <div class="cell w44">
                                        <p>汉语水平 - (必填)</p>
                                        <p>很好</p>
                                    </div>
                                    <div class="cell w142">
                                        <p>HSK考试等级或其他类型汉语考试成绩</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>英语水平 - (必填)</p>
                                        <p>很好</p>
                                    </div>
                                    <div class="cell w142">
                                        <p>英语能力证书</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>申请类别 - (必填)</p>
                                        <p>硕研</p>
                                    </div>
                                    <div class="cell w142">
                                        <p>学科门类 - (必填)</p>
                                        <p>农学</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>授课语言 - (必填)</p>
                                        <p>汉语</p>
                                    </div>
                                    <div class="cell w142">
                                        <p>专业 - (必填)</p>
                                        <p>动物遗传育种与繁殖</p>
                                    </div>
                                    <div class="cell w190">
                                        <p>申请院校 - (必填)</p>
                                        <p>安徽大学</p>
                                    </div>
                                    <div class="cell w190">
                                        <p>学习时间 - (必填)</p>
                                        <p>2016-06-24 -- 2016-06-25</p>
                                    </div>
                                        <div class="cell w190">
                                            <p>申请奖学金期限（申请提交后，由系统根据项目自动匹配）</p>
                                            <p> -- </p>
                                        </div>
                                        <div class="cell w55">
                                            <p>是否获得奖励 - (必填)</p>
                                            <p>否</p>
                                        </div>
                                        <div class="cell w131">
                                            <p>获奖类型及描述</p>
                                            <p></p>
                                        </div>
                                        <div class="cell w55">
                                            <p>是否发表文章 - (必填)</p>
                                            <p>否</p>
                                        </div>
                                        <div class="cell w131">
                                            <p>发表文章类型及描述</p>
                                            <p></p>
                                        </div>
                                        <div class="cell w55">
                                            <p>是否担任社会职务 - (必填)</p>
                                            <p>否</p>
                                        </div>
                                        <div class="cell w131">
                                            <p>职务及任职时间</p>
                                            <p></p>
                                        </div> 
                                    <div class="cell w55">
                                        <p>是否曾在华学习或任职 - (必填)</p>
                                        <p>否</p>
                                    </div>
                                    <div class="cell w85">
                                        <p>学习或任职单位</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>起止时间</p>
                                        <p> -- </p>
                                    </div>
                                    <div class="cell w55">
                                        <p>是否曾获得奖学金来华学习 - (必填)</p>
                                        <p>否</p>
                                    </div>
                                    <div class="cell w85">
                                        <p>就读院校</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>起止时间</p>
                                        <p> -- </p>
                                    </div>
                                </div>
                            </div>
                            <div class="itemBox">
                                <h2 class="itemTitle">在华事务联系人或机构及亲属情况：</h2>
                                <div class="clearfix">
                                    <div class="cell w142">
                                        <p>在华事务联系人或机构名称</p>
                                        <p>a</p>
                                    </div>
                                    <div class="cell w44">
                                        <p>电话</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w142">
                                        <p>E-mail</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>传真</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>地址</p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <span style="left: 1.5mm;">流水号: 131c25e00604af35bf30af4f45cf744c</span>
                            <span>第2页，共3页</span>
                            <span style="right: 1.5mm;">生成日期: 2016-06-28</span>
                        </div>
                    </div>
                    <div class="wrapBox">
                        <div class="innerBox">
                            <div class="itemBox">
                                <div class="clearfix">
                                    <div class="cell w190">
                                        <p>配偶姓名</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>配偶年龄</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w142">
                                        <p>配偶职业</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>父亲姓名</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>父亲年龄</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w142">
                                        <p>父亲职业</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w190">
                                        <p>母亲姓名</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w44">
                                        <p>母亲年龄</p>
                                        <p></p>
                                    </div>
                                    <div class="cell w142">
                                        <p>母亲职业</p>
                                        <p></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            <span style="left: 1.5mm;">流水号: 131c25e00604af35bf30af4f45cf744c</span>
                            <span>第3页，共3页</span>
                            <span style="right: 1.5mm;">生成日期: 2016-06-28</span>
                        </div>
                    </div>
                </body>
                </html>`, {
                        height: '297mm',
                        width: '210mm'
                    })
                        .toBuffer((err, buffer) => {
                        // console.log({ err, buffer });
                        console.log(res.writable);
                    });
                }
                catch (error) {
                    console.log({ error: error });
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
                    body.html = decodeURIComponent(body.html);
                    body.options = JSON.parse(body.options);
                    console.log({ formHtml: body.html, formOptions: body.options });
                    generatePdf(body.html, body.options, res);
                });
            }
        }
    }
    else {
        res.statusCode = 404;
        res.end();
    }
});
server.listen(3001);
console.log('Listening on port 3001...');
//# sourceMappingURL=app.js.map