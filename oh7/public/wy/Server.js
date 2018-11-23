var http=require('http');
var fs = require('fs');
http.createServer(function(req,res){
res.setHeader('Access-Control-Allow-Origin', '*');
    if(req.url=="/"){return;}
    req.url=req.url.substr(1);
    xxt(req.url,res);
}).listen(3000);
console.log("Success...");

function xxt(url,res){
    if(url.indexOf('?=')>0){
	url=url.substr(0,url.length-3);
	console.log(url);
    }

    if(url.substr(url.length-4)=='html'){
	res.writeHead(200, {'Content-Type': 'text/html'});
    }else
    if(url.substr(url.length-3)=='png'){
   	res.writeHead(200,{'Content-Type':'image/png'});
    }else
    if(url.substr(url.length-3)=='jpg'){
	res.writeHead(200,{'Content-Type':'image/jpeg'});
    }
    else{
	res.writeHead(200, {'Content-Type': 'text/html'});
    }
    console.log(url);
    fs.readFile(url,function(err,data){
	res.write(data);
	res.end();	
    });

}