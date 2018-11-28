

// 邵石服务器的路径
const otherpath = 'https://oh2.daotongkeji.com'
const uploadFolde = 'upload';
const userfile = 'userfile';
const excelFile = 'excelFile';

var symbol = '\\';  // 这个是决定window系统\\与linux下的/的;

const port = '1238';
var http = 'http://192.168.1.131:' + port + '/';

const platform = 'window';
// const platform = 'linux';
if (platform == 'linux') {
    symbol = '/';
    http = '47.95.226.238:1238/';
} 