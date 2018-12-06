// let WebSocket = require('ws');
// var ws = new WebSocket("ws://192.168.1.138:2222");
// ws.onopen = function () {
//     console.log('我连接到服务器了');
// }
// ws.onmessage = function(e) {
//     let data = e.data;
//     console.log('我接受到了来自服务器的消息'+data);
// }
// ws.onclose = function(event) {
//     var code = event.code;
//     var reason = event.reason;
//     var wasClean = event.wasClean;
//     console.log('我得错误码为：'+code,'我得错误原因为：'+reason,'我得清除事件:'+wasClean);
// // }





// let writeStream = promise.promisify(function (path, chunk, cb) {
//     const base64 = arrayBufferToBase64(chunk)
//     console.log(base64);
//     console.log(path);
//     chunk = chunk.toString('base64');
//     var writable = fs.createWriteStream(path, {
//         flags: 'w',
//         defaultEncoding: 'base64',
//         mode: 0666,
//     });

//     writable.on('finish', function () {
//         console.log('write finished');
//         writable.end();
//         cb(null)
//         // process.exit(0);
//     });
//     writable.on('error', function (err) {
//         console.log('write error - %s', err.message);
//     });
//     writable.write(base64, 'base64');
// })
function toBuffer(ab) {
    let buf = new Buffer({ type: 'Buffer', data: Object.values(ab) })
    return buf;
}
// function arrayBufferToBase64(buffer) {
//     console.log(buffer);
//     var binary = '';
//     var bytes = new Uint8Array(buffer);
//     console.log(bytes);
//     var len = bytes.byteLength;
//     for (var i = 0; i < len; i++) {
//         binary += String.fromCharCode(bytes[i]);
//     }
//     return Window.btoa(binary);
// }
// // var buf = new Uint8Array([11,22,33]);
// let a = arrayBufferToBase64([11,22,33]); //"CxYh"
// console.log(a );

let a = 'd:\nodeApp\oh5\public\excelFile\1544003920790.xlsx';
let pt2 = a.split('excelFile' + '\/')[1];
console.log(pt2);