/*
 * Name: 获取Bilibili视频信息和地址
 * Author: Qiang Ge
 * Mail: 2962051004@qq.com
 * Deta: 2018-4-17 9:28
 * Website: https://api.yya.gs
*/

var app = require('express')();
var request = require('request');
app.set('json spaces', 2);
// http://localhost:3000/?aid=170001
app.get("/", function(req, res, next) {
	if (!req.query.aid) return res.send({
		code: -1,
		msg: "aid 参数不完整"
	});
	var aid = req.query.aid;
	RandomNum = (function(Min, Max) {
		var Range = Max - Min;
		var Rand = Math.random();
		var num = Min + Math.floor(Rand * Range);
		return num;
	}(100, 200));
	var result = {
	 code: -1,
	 error: ''
	};
	var apihost = 'https://api.bilibili.com';
	var options = {
		url: apihost + '/view?type=jsonp&appkey=8e9fc618fbd41e28&id=' + aid,
		method: 'GET',
		headers: {
			"User-Agent": "request",
			"Accept": "*/*",
			"Referer": "http://www.bilibili.com",
			"Cookie": "buvid3=FE09F518-E432-414C-AF62-4493C27AD0366" + RandomNum + "infoc"
		}
	};

	request(options, function(error, response, data) {
		if (error || response.statusCode != 200) {
		 result['error'] = '接口出现异常';
			return res.send(result);
		}
		data = JSON.parse(data);
		if (typeof data.code != "undefined") {
		 result['error'] = 'aid不存在';
			return res.send(result);
		}
		result['code'] = 1;
		result['title'] = data.title; //视频标题
		result['description'] = data.description;//视频简介
		result['pic'] = data.pic;//视频封面
		result['created_at'] = data.created_at;//上传时间
		result['up'] = {
			name: data.author,//up主名称
			face: data.face,//up主头像
			id: data.mid,//up主id
			uplink: 'https://space.bilibili.com/' + data.mid + '/#!/'//up主主页地址
		};
		options.url = apihost + '/playurl?aid=' + aid + '&platform=html5&quality=1&vtype=mp4&type=json';
		request(options, function(error, response, data) {
			data = JSON.parse(data);
			result['video_data'] = {
				video_url: data['durl'][0]['url'], //视频有防盗链，无法在线观看，请用下载器下载
				videotime: (data.durl[0].length / 60000).toFixed(2) + '分', //视频时间
				format: data.format, //视频格式
				videosize: (data.durl[0].size / 1048576).toFixed(2) + 'Mb' //视频大小
			};
			res.send(result);
		});
	});
});

app.listen(3000);