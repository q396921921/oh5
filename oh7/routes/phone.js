var express = require('express');
var router = express.Router();
var fs = require('fs');
var url = require('url')
var qs = require('querystring');
var path1 = require('path');
var momoent = require('moment');
var public = require("./../public/public");
var UUID = require('uuid');   // ����Ψһ��ͼƬ��UID
var path = public.path3;



var mdOrder = require('./methodOrder');
var mdEmp = require('./methodEmp');
var mdData = require('./methodData');


router.post('/getOrders', function (req, res, next) {
    let body = req.body;
    mdOrder.getOrders(body, (ret) => {
        res.send(ret)
    })
})
router.post('/getProductById', function (req, res, next) {
    let body = req.body;
    mdOrder.getProductById(body, (ret) => {
        res.send(ret)
    })
})
router.post('/getFlowByFlow_detail_id', function (req, res, next) {
    let body = req.body;
    mdOrder.getFlowByFlow_detail_id(body, (ret) => {
        res.send(ret)
    })
})
router.post('/getFlow', function (req, res, next) {
    let body = req.body;
    mdOrder.getFlow(body, (ret) => {
        res.send(ret)
    });
})
router.post('/getStatess', function (req, res, next) {
    let body = req.body;
    mdOrder.getStatess(body, (ret) => {
        res.send(ret)
    });
})
router.post('/getState', function (req, res, next) {
    let body = req.body;
    mdOrder.getState(body, (ret) => {
        res.send(ret.toString())
    });
})
router.post('/getStates', function (req, res, next) {
    let body = req.body;
    mdOrder.getStates(body, (ret) => {
        res.send(ret)
    });
})
router.post('/getProductsByTypeId', function (req, res, next) {
    let body = req.body;
    mdOrder.getProductsByTypeId(body, (ret) => {
        res.send(ret)
    })
})
router.get('/getType', function (req, res, next) {
    mdOrder.getProductTypes({}, (ret) => {
        res.send(ret)
    })
})
router.post('/getScreen', function (req, res, next) {
    let body = req.body;
    mdOrder.screenOrder(body, (ret) => {
        res.send(ret)
    })
})
router.post('/screen', function (req, res, next) {
    let body = req.body;
    mdOrder.screen(body, (ret) => {
        res.send(ret)
    });
})
router.post('/getDep', function (req, res, next) {
    let body = req.body;
    mdEmp.getDep(body, (ret) => {
        res.send(ret);
    })
})
router.post('/getEmpName', function (req, res, next) {
    let body = req.body;
    mdEmp.getEmpName(body, (ret) => {
        res.send(ret);
    })
})
router.post('/getUser', function (req, res, next) {
    let body = req.body;
    mdEmp.getEmp(body, (ret) => {
        res.send(ret)
    })
})

router.get('/pmain', function (req, res, next) {
    let ul = url.parse(req.url)
    let ulstr = ul.pathname
    ulstr = ulstr.substring(1);
    ul = qs.parse(ul.query)
    let username = ul.username;
    res.cookie("path", path);
    res.cookie('username', username);
    res.render('pmain');
});
router.get('/phone/allOrders', function (req, res, next) {
    res.cookie('menu', 'allOrders');
    res.render('phone/allOrders')
});
router.get('/phone/screen', function (req, res, next) {
    res.cookie('menu', 'screen');
    res.render('phone/screen')
});
router.get('/css/*', function (req, res, next) {
    let ul = url.parse(req.url)
    let ulstr = ul.pathname
    fs.createReadStream('./views/' + ulstr).pipe(res);
});
router.get('/js/*', (function (req, res, next) {
    let ul = url.parse(req.url)
    let ulstr = ul.pathname
    fs.createReadStream('./views' + ulstr).pipe(res);
}))

module.exports = router;