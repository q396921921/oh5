var url='http://192.168.1.238:1239';
var id=GetQueryString('new_id');
if(id!=null){
	console.log(id);
	var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
				var response = xhr.responseText;
				response=jiexi(response);
				console.log('新闻数据:',response);
				CreatHtml(response);
			}
		};
	xhr.open("POST",url+"/users/getNews", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send(JSON.stringify({new_id:41}));
}
function jiexi(val){
	var a=JSON.parse(val).data[0];
	a.imgPath=a.imgPath.split(";");
	a.newsData=JSON.parse(a.newsData);
	a.title=JSON.parse(a.title);
	a.title2=JSON.parse(a.title2);
	a.time=new Date(+new Date(a.time) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').split(' 00:00:00')[0];
	for(var i=0;i<a.imgPath.length;i++){
		a.newsData.info=a.newsData.info.replace('<picture>','<br><img src='+url+'/upload/'+a.imgPath[i]+' onClick=yulan(this.src);><br>');
	}
	return a;
}
function CreatHtml(val){
	var a=document.getElementById('All');
	if(val.title!=null){
		var h2=document.createElement('h2');
		h2.style.fontSize=val.title.title_size+'px';
		h2.style.color=val.title.title_color;
		h2.style.fontWeight=val.title.title_weight;
		h2.style.lineHeight='1.4px';
		h2.innerHTML=val.title.info;
		a.appendChild(h2);
	}
	if(val.title2!=null){
		var h3=document.createElement('span');
		h3.style.fontSize=val.title2.title2_size+'px';
		h3.style.color=val.title2.title2_color;
		h3.style.fontWeight=val.title2.title2_weight;
		//h3.style.cssFloat='right';
		h3.innerHTML=val.title2.info;
		a.appendChild(h3);
		a.appendChild(document.createElement('br'));
	}
	if(val.time!=null){
		var time=document.createElement('p');
		time.style.fontSize='15px';
		//time.style.lineHeight='1.4px';
		time.style.color='#4C4C4C';
		time.innerHTML=val.time;
		a.appendChild(time);
	}
	if(val.newsData!=null){
		var div=document.createElement('div');
		div.style.fontSize='15px';
		div.style.letterSpacing='1.5px';
		div.innerHTML=val.newsData.info;
		a.appendChild(div);
	}
	/*var img=document.createElement('img');
	img.id='imgs';
	img.src='img/2.png';
	img.style.width='300px';
	a.appendChild(img);*/
}    


function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);//search,查询？后面的参数，并匹配正则
     if(r!=null)return  unescape(r[2]); return null;
}
