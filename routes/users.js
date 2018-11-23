var express = require('express');
var router = express.Router();
var fs = require('fs');
var url = require('url')
var qs = require('querystring');
var path1 = require('path');
var momoent = require('moment');
var public = require("./../public/public");
var UUID = require('uuid');   // ����Ψһ��ͼƬ��UID
var path = public.path;


var multer = require('multer');		//������ģ��
var storage = multer.diskStorage({	//ͨ�������������ϴ��ļ�����������
  destination: function (req, file, cb) {
    cb(null, path1.join(__dirname, "../public/" + public.uploadFolde));
  },
  filename: function (req, file, cb) {
    var name = file.mimetype.split('/')[1];
    var ID = UUID.v1();
    cb(null, ID + '.' + name);
  }
})
var upload = multer({ storage: storage });
router.use(upload.array('file', 50));	//


var mdOrder = require('./methodOrder');
var mdEmp = require('./methodEmp');
var mdData = require('./methodData');

router.get('/favicon.ico', function (req, res, next) {
  res.send('null');
})
router.get('/login', function (req, res, next) {
  res.cookie("path", path);
  res.render('login')
})
router.post('/log', function (req, res, next) {
  var body = req.body;
  let username = body.username;
  mdEmp.getUserByUserPass(body, (ret) => {
    if (ret == 'success') {
      res.cookie("username", username)
      res.send(username);
    } else if (ret == 'error') {
      res.send('error')
    } else {
      res.send(ret);
    }
  })
})
router.get('/upload/*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  res.sendfile("." + ulstr)
})

// router.all('/*', function (req, res, next) {
//   let username = req.cookies.username;
//   if (username && username != "") {
//     next();
//   } else {
//     res.render('login')
//   }
// })

router.get('/main', function (req, res, next) {
  let ul = url.parse(req.url)
  ul = qs.parse(ul.query)
  let state = ul.state;
  let menu = ul.menu;
  res.cookie('state', state);
  res.cookie('menu', menu);
  res.render('main')
})

router.post('/outUser', function (req, res, next) {
  var username = req.body.username;
  res.send('success')
})

router.get('/iframe', function (req, res, next) {
  res.render('iframe')
});

router.get('/appli/ceshi*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  ulstr = ulstr.substring(1);
  ul = qs.parse(ul.query)
  let menu = ul.menu;
  res.cookie('menu', menu);
  res.render(ulstr, { ttt: 123456 })
});
router.post('/getOrders', function (req, res, next) {
  let body = req.body;
  mdOrder.getOrders(body, (ret) => {
    res.send(ret)
  })
})
// 获得当前人物权限所有未被处理的订单
router.post('/getNoHandleOrders', function (req, res, next) {
  let body = req.body;
  mdOrder.getNoHandleOrders(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getFlowByFlow_detail_id', function (req, res, next) {
  let body = req.body;
  mdOrder.getFlowByFlow_detail_id(body, (ret) => {
    res.send(ret)
  })
})
router.get('/getType', function (req, res, next) {
  mdOrder.getProductTypes({}, (ret) => {
    res.send(ret)
  })
})
router.post('/getStates', function (req, res, next) {
  let body = req.body;
  mdOrder.getStates(body, (ret) => {
    res.send(ret)
  });
})
router.post('/getFlow', function (req, res, next) {
  let body = req.body;
  mdOrder.getFlow(body, (ret) => {
    res.send(ret)
  });
})
router.post('/deleteOrder', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteOrder(body, (ret) => {
    res.send(ret)
  });
})
router.post('/getState', function (req, res, next) {
  let body = req.body;
  mdOrder.getState(body, (ret) => {
    res.send(ret.toString())
  });
})
router.post('/getStatess', function (req, res, next) {
  let body = req.body;
  mdOrder.getStatess(body, (ret) => {
    res.send(ret)
  });
})
router.post('/setFailReason', function (req, res, next) {
  let body = req.body;
  mdOrder.setFailReason(body, (ret) => {
    res.send(ret)
  })
})
router.post('/updateProfit', function (req, res, next) {
  let body = req.body;
  mdOrder.updateProfit(body, (ret) => {
    res.send(ret);
  })
})
router.get('/getProfit', function (req, res, next) {
  mdOrder.getProfit((ret) => {
    res.send(ret)
  })
})
router.post('/setState', function (req, res, next) {
  let body = req.body;
  mdOrder.setState(body, (ret) => {
    res.send(ret)
  });
})
router.post('/setFlow', function (req, res, next) {
  let body = req.body;
  mdOrder.setFlowTime(body, (ret) => {
    res.send(ret)
  });
})
router.post('/updateOrder', function (req, res, next) {
  let body = req.body;
  mdOrder.updateOneOrder(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getNotAppliOrders', function (req, res, next) {
  let body = req.body;
  mdOrder.getNotAppliOrders(body, (ret) => {
    res.send(ret)
  })
})
router.post('/setOrder_state2', function (req, res, next) {
  let body = req.body;
  mdOrder.setOrder_state(body, (ret) => {
    res.send(ret)
  })
})
router.post('/setRefund_state', function (req, res, next) {
  let body = req.body;
  mdOrder.setRefund_state(body, (ret) => {
    res.send(ret)
  })
})





router.post('/getScreen', function (req, res, next) {
  let body = req.body;
  mdOrder.screenOrder(body, (ret) => {
    res.send(ret)
  })
})
router.get('/public/images/true.jpg', (req, res, next) => {
  res.sendfile('public/images/true.jpg')
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
router.post('/writeExcel', function (req, res, next) {
  let body = req.body;
  let data = body.data;
  mdOrder.writeExcel(JSON.parse(data), (flag, pathStr) => {
    if (flag == 'true') {
      res.send(pathStr)
    } else {
      res.send('error')
    }
  })
})



//////////////////////�˻�������ҳ
router.get('/user/ceshi*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  ulstr = ulstr.substring(1);
  ul = qs.parse(ul.query)
  let menu = ul.menu;

  res.cookie('menu', menu);
  res.render(ulstr)
})
router.get('/getRoles', function (req, res, next) {
  mdEmp.getRoles(null, (ret) => {
    res.send(ret);
  })
})
router.post('/getRole', function (req, res, next) {
  let body = req.body;
  mdEmp.getRole(body, (ret) => {
    res.send(ret);
  })
})
router.post('/createUsers', function (req, res, next) {
  let body = req.body;
  mdEmp.createUser(body, (ret) => {
    res.send(ret)
  })
})




// ///////�˻�,������ҳ
router.post('/getEmpName', function (req, res, next) {
  let body = req.body;
  mdEmp.getEmpName(body, (ret) => {
    res.send(ret);
  })
})
router.post('/selectUsers', function (req, res, next) {
  let body = req.body;
  mdEmp.getEmpByType2(body, (ret) => {
    res.send(ret)
  })
})
router.post('/outputUser', function (req, res, next) {
  let body = req.body;
  mdEmp.selectAndOutUsers(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getResource', function (req, res, next) {
  let body = req.body;
  mdEmp.getAllResourcesChecked(body, (ret) => {
    res.send(ret)
  })
})
router.get('/recoverAllreource', function (req, res, next) {
  mdEmp.recoverAllreource(null, (ret) => {
    res.send(ret)
  })
})
router.post('/updateRoleResource', function (req, res, next) {
  let body = req.body;
  mdEmp.updateRoleResource(body, (ret) => {
    res.send(ret)
  })
})
router.post('/updateRoleToUser', function (req, res, next) {
  let body = req.body;
  mdEmp.updateRoleToUser(body, (ret) => {
    res.send(ret)
  })
})
router.post('/recoverPower', function (req, res, next) {
  let body = req.body;
  mdEmp.recoverPower(body, (ret) => {
    res.send(ret);
  })
})
router.post('/updateUserResource', function (req, res, next) {
  let body = req.body;
  mdEmp.updateUserResource(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getOneUserResource', function (req, res, next) {
  let body = req.body;
  mdEmp.getOneUserResource(body, (ret) => {
    res.send(ret)
  })
})
router.post('/deleteUser', function (req, res, next) {
  let body = req.body;
  mdEmp.deleteUser(body, (ret) => {
    res.send(ret)
  })
})



// ///////�˻�,�޸���Ϣ��ҳ
router.post('/getUser', function (req, res, next) {
  let body = req.body;
  mdEmp.getEmp(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getUserByUserPass', function (req, res, next) {
  let body = req.body;
  mdEmp.getUserByUserPass(body, (ret) => {
    res.send(ret)
  })
})
router.post('/updateUserInfo', function (req, res, next) {
  let body = req.body;
  let exist = body.exist;
  mdEmp.updateUserInfo(body, (ret) => {
    if (exist && ret == 'success') {

    }
    res.send(ret)
  })
})
router.post('/updateUser6', function (req, res, next) {
  let body = req.body;
  mdEmp.updateUser6(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getUser6', function (req, res, next) {
  let body = req.body;
  mdEmp.getEmpByType2(body, (ret) => {
    res.send(ret)
  })
})







router.get('/other/ceshi*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  ulstr = ulstr.substring(1);
  ul = qs.parse(ul.query)
  let menu = ul.menu;

  res.cookie('menu', menu);
  res.render(ulstr)
});
router.get('/getzizhiInfo', function (req, res, next) {
  let body = req.body;
  mdData.getzizhi(body, (ret) => {
    res.send(ret)
  })
})
router.get('/gethome_page', function (req, res, next) {
  let body = req.body;
  mdData.get_home_page(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getProductsByTypeId', function (req, res, next) {
  let body = req.body;
  mdOrder.getProductsByTypeId(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getProEmp', function (req, res, next) {
  let body = req.body;
  mdOrder.getProEmp(body, (ret) => {
    res.send(ret)
  })
})
router.get('/getbusiness', function (req, res, next) {
  let body = req.body;
  mdData.getbusiness(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getPartnerBankOrOrgan', function (req, res, next) {
  let body = req.body;
  mdData.getPartnerBank(body, (ret) => {
    res.send(ret);
  })
})


router.post('/updateData', function (req, res, next) {
  let database = req.body.database;
  if (database == 'zizhi') {
    mdData.updatezizhi(req, (ret) => {
      res.send(ret);
    })
  } else if (database == 'home_page') {
    mdData.updatehome_page(req, (ret) => {
      res.send(ret);
    })
  } else if (database == 'business') {
    mdData.updatebusinessAndPartner(req, (ret) => {
      res.send(ret);
    })
  } else if (database == 'partner') {
    mdData.updatepartnerDetail(req, (ret) => {
      res.send(ret);
    })
  }
})


// 新闻
router.post('/insertNew', function (req, res, next) {
  mdData.insertNew(req, (ret) => {
    res.send(ret)
  })
})
router.post('/getNews', function (req, res, next) {
  let body = req.body;
  // body = JSON.parse(Object.keys(body));
  mdData.getNews(body, (ret) => {
    res.send(ret)
  })
})
router.post('/updateNew', function (req, res, next) {
  mdData.updateNew(req, (ret) => {
    res.send(ret);
  })
})
router.post('/deleteNew', function (req, res, next) {
  let body = req.body;
  mdData.deleteNew(body, (ret) => {
    res.send(ret);
  })
})

// 获得所有的数据(实际增长量)
router.post('/getAllData', function (req, res, next) {
  let body = req.body;
  mdData.getAllData(body, (ret) => {
    res.send(ret);
  })
})
// 获得增长基数与指数
router.get('/getDataAB', function (req, res, next) {
  mdData.getDataAB("", (ret) => {
    res.send(ret);
  })
})
// 修改增长基数与指数
router.post('/updateDataAB', function (req, res, next) {
  let body = req.body;
  mdData.updateDataAB(body, (ret) => {
    res.send(ret);
  })
})






router.get('/product/ceshi*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  ulstr = ulstr.substring(1);
  ul = qs.parse(ul.query)
  let menu = ul.menu;
  res.cookie('menu', menu);
  res.render(ulstr)
});
router.post('/getProductById', function (req, res, next) {
  let body = req.body;
  mdOrder.getProductById(body, (ret) => {
    res.send(ret)
  })
})
router.post('/getSortFlowState', function (req, res, next) {
  let body = req.body;
  mdOrder.getSortFlowState(body, (ret) => {
    res.send(ret);
  })
})
router.post('/getDetailFile_types', function (req, res, next) {
  let body = req.body;
  mdOrder.getDetailFile_types(body, (ret) => {
    res.send(ret);
  })
})
router.get('/getFlowNameId', function (req, res, next) {
  let body = req.body;
  mdOrder.getFlowNameId(body, (ret) => {
    res.send(ret);
  })
})
router.get('/getFile_typeNameId', function (req, res, next) {
  let body = req.body;
  mdOrder.getFile_typeNameId(body, (ret) => {
    res.send(ret);
  })
})
router.get('/getDetailFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.getDetailFileType(body, (ret) => {
    res.send(ret);
  })
})
router.post('/updateProductInfo', function (req, res, next) {
  mdOrder.updateProductInfo(req, (ret) => {
    res.send(ret);
  })
})
router.post('/insertProduct', function (req, res, next) {
  mdOrder.insertProduct(req, (ret) => {
    res.send(ret);
  })
})
router.post('/insertProductType', function (req, res, next) {
  mdOrder.insertProductType(req, (ret) => {
    res.send(ret);
  })
})
router.post('/createFlow', function (req, res, next) {
  let body = req.body;
  mdOrder.createFlow(body, (ret) => {
    res.send(ret);
  })
})
router.post('/deleteFlow', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteFlow(body, (ret) => {
    res.send(ret);
  })
})
router.post('/deleteProduct', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteProduct(body, (ret) => {
    res.send(ret);
  })
})

router.post('/createFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.insertFileType(body, (ret) => {
    res.send(ret);
  })
})
router.post('/createDetailFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.insertDetailFileType(body, (ret) => {
    res.send(ret);
  })

})
router.post('/deleteFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteFileType(body, (ret) => {
    res.send(ret);
  })
})
router.post('/deleteDetailFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteDetailFileType(body, (ret) => {
    res.send(ret);
  })
})
router.post('/updateFileType', function (req, res, next) {
  let body = req.body;
  mdOrder.updateFileType(body, (ret) => {
    res.send(ret);
  })
})
// 分配给内勤商品
router.post('/allotProduct', function (req, res, next) {
  let body = req.body;
  mdOrder.allotProduct(body, (ret) => {
    res.send(ret);
  })
})
// 获得这个商品对应的内勤
router.post('/getOffByProduct_id', function (req, res, next) {
  let body = req.body;
  mdOrder.getOffByProduct_id(body, (ret) => {
    res.send(ret);
  })
})
// 删除这个商品对应的内勤
router.post('/deleteOffPro', function (req, res, next) {
  let body = req.body;
  mdOrder.deleteOffPro(body, (ret) => {
    res.send(ret);
  })
})





router.get('/dep/ceshi*', function (req, res, next) {
  let ul = url.parse(req.url)
  let ulstr = ul.pathname
  ulstr = ulstr.substring(1);
  ul = qs.parse(ul.query)
  let menu = ul.menu;
  res.cookie('menu', menu);
  res.render(ulstr)
});
router.post('/createDep', function (req, res, next) {
  let body = req.body;
  mdEmp.createDep(body, (ret) => {
    res.send(ret);
  })
})
router.get('/getAllDep', function (req, res, next) {
  let body = req.body;
  mdEmp.getAllDep(body, (ret) => {
    res.send(ret);
  })
})
router.post('/getAllEmpNotAllot', function (req, res, next) {
  let body = req.body;
  mdEmp.getAllEmpNotAllot(body, (ret) => {
    res.send(ret)
  })
})
router.post('/allotUser', function (req, res, next) {
  let body = req.body;
  mdEmp.allotUser(body, (ret) => {
    res.send(ret)
  })
})
router.post('/allotManager', function (req, res, next) {
  let body = req.body;
  mdEmp.allotManager(body, (ret) => {
    res.send(ret)
  })
})
router.post('/deleteDepUser', function (req, res, next) {
  let body = req.body;
  mdEmp.deleteDepUser(body, (ret) => {
    res.send(ret)
  })
})
router.post('/deleteManager', function (req, res, next) {
  let body = req.body;
  mdEmp.deleteManager(body, (ret) => {
    res.send(ret)
  })
})
router.post('/deleteDep', function (req, res, next) {
  let body = req.body;
  mdEmp.deleteDep(body, (ret) => {
    res.send(ret)
  })
})





router.get('/' + public.userfile + '/*', function (req, res, next) {
  res.download('.' + req.path)
})
router.get('/' + public.excelFile + '/*', function (req, res, next) {
  res.download('.' + req.path)
})









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


router.get('/text', function (req, res, next) {
  res.render('te')
})

function getPostData(req, res, callback) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    if (body == '' || !body) {
      res.send(JSON.stringify({ "body": "null" }));
    }
    else {
      callback(JSON.parse(body));
    }
  });
}

module.exports = router;