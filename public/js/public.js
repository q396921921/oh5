﻿

// 邵石服务器的路径
const otherpath = 'https://oh2.daotongkeji.com'
const uploadFolde = 'upload';
const userfile = 'userfile';
const excelFile = 'excelFile';

var symbol = '\\';  // 这个是决定window系统\\与linux下的/的;

const port = '1238';
var http = 'http://192.168.1.238:' + port + '/';

const platform = 'window';
// const platform = 'linux';
if (platform == 'linux') {
    symbol = '/';
    http = '47.95.226.238:1238/';
} 
// let a = '18735182157\1705\e2f38ff0-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\e2f93540-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\e7d5de10-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\e7e9b430-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\eddde780-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\edf4a3d0-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f00eaa30-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f0169970-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f4d58110-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f4e67100-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f9868600-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\f99f1710-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\fc531380-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\fc6710b0-f2b7-11e8-a1bf-339aba955751.jpg;18735182157\1705\02cc5550-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\02e311a0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\0636d080-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\06472430-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\0aba0eb0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\0ad5ad00-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\0eef7b00-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\0eff5980-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\138c0d90-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\13a6c180-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\17792640-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\178fe290-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\1c7e8cc0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\1c959730-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\202610f0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\203664a0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\25a673d0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\25b93880-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\2ba184f0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\2bc316b0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\34298280-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\344e6fa0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\38bcc640-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\38ccf2e0-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\3c661f30-f2b8-11e8-a1bf-339aba955751.jpg;18735182157\1705\3c7a1c60-f2b8-11e8-a1bf-339aba955751.jpg;'
// console.log(a.split(';').length);