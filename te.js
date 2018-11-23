
// var socket_io = require('socket.io-client');
// let socket = socket_io.connect('http://192.168.1.121:3333');

// setTimeout(() => {
//     let order_type = "1";
//     socket.emit('createOrder', order_type);
// }, 1000);

// socket.on('getOrder_id', (data) => {
//     console.log('我收到了服务器返回的订单id: ' + data.order_id);
// })
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


