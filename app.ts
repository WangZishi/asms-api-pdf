import * as http from 'http';
import * as fs from 'fs';

const pdf = require('html-pdf');
const formBody = require('body/form');
const jsonBody = require('body/json');

const server = http.createServer((req, res) => {

    if (req.method === 'GET' && req.url === '/api/v2/pdf/health') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'ok' }));
    } else if (req.method === 'POST' && req.url === '/api/v2/pdf') {
        if (req.headers['content-type'] !== 'application/json' &&
            req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
            res.statusCode = 415;
            res.end();
        } else {
            let body: { html: string, options: any }, html: string, options: string,
                generatePdf = (html, options, res: http.ServerResponse) => {
                    let filename = options.filename || 'render';
                    try {
                        console.log({ filename, html });
                        pdf.create(html, {
                            height: '297mm',
                            width: '210mm'
                        })
                            // .toStream((err, stream: NodeJS.ReadableStream) => {
                            //     if (!!err) res.end(err);
                            //     else {
                            //         res.setHeader('Content-Type', 'application/pdf');
                            //         res.setHeader('Content-Disposition', `attachment;filename="${filename}.pdf"`);
                            //         stream.pipe(res);
                            //     }
                            // });
                            .toBuffer((err, buffer: Buffer) => {
                                console.log({ err, buffer });
                                console.log(res.writable);
                            });
                    } catch (error) {
                        console.log({ error });
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
server.listen(3001);
console.log('Listening on port 3001...');
