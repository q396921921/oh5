// 专门处理前端动态数据显示的模块

var fs = require('fs');
var url = require('url')
var qs = require('querystring');
var queryData = require('./../db_mysql/queryData')
var otherData = require('./../db_mysql/otherData')
var queryOrder = require('./../db_mysql/queryOrder')
var async = require('async')
var momoent = require('moment');
var xlsx = require('node-xlsx');
var path = require('path');
var timer = require('./timer');
var debug = require('debug')('app:server');
var public = require('./../public/public');
var symbol = public.symbol;
var uploadFile = public.uploadFolde;      // 后台修改上传图片文件的文件夹名字

module.exports = {

    updateDataAB: function (body, cb) {
        let loanA = body.loanA;
        let loanB = body.loanB;
        let dealA = body.dealA;
        let dealB = body.dealB;
        let callA = body.callA;
        let callB = body.callB;
        let empA = body.empA;
        let empB = body.empB;
        let arr = [loanA, loanB, dealA, dealB, callA, callB, empA, empB];
        otherData.updateDataAB(arr, (err, ret) => {
            if (err) {
                cb('error');
            } else {
                cb('success');
            }
        })
    },
    /**
     * 获得增长基数与增长指数
     */
    getDataAB: function (body, cb) {
        otherData.getDataAB((err, ret) => {
            if (err) {
                cb('error');
            } else {
                console.log(ret);
                cb(JSON.stringify({ data: ret[0] }));
            }
        })
    },
    /**
     * 查询实际数据增长量
     */
    getAllData: function (body, cb) {
        let time1 = body.time1;
        let time2 = body.time2;
        let arr = [time1, time2];
        let data = {};
        async.auto([
            function (cb2) {
                otherData.selectDealData(arr, (err, ret) => {
                    if (err) {
                        cb('error')
                    } else {
                        data.deals = ret[0]['count(*)'];
                        cb2();
                    }
                })
            },
            function (cb2) {
                otherData.selectEmpData(arr, (err, ret) => {
                    if (err) {
                        cb('error')
                    } else {
                        data.emps = ret[0]['count(*)'];
                        cb2();
                    }
                })
            },
            function (cb2) {
                otherData.selectLoanData(arr, (err, ret) => {
                    if (err) {
                        cb('error')
                    } else {
                        data.loans = ret[0]['sum(money)'];
                        cb2();
                    }
                })
            },
            function (cb2) {
                otherData.selectcallData(arr, (err, ret) => {
                    if (err) {
                        cb('error')
                    } else {
                        data.calls = ret[0]['count(*)'];
                        cb2();
                    }
                })
            },
        ], function (err) {
            cb(JSON.stringify(data));
        })
    },
    /**
     * 删除一条新闻
     */
    deleteNew: function (body, cb) {
        let new_id = body.new_id;
        otherData.deleteNew([new_id], (err, ret) => {
            if (err) {
                cb('error')
            } else {
                cb('success');
            }
        })
    },
    /**
     * 修改新闻
     */
    updateNew: function (req, cb) {
        let body = req.body;
        let new_id = body.new_id;
        let title = JSON.stringify(body.title);
        let title2 = JSON.stringify(body.title2);
        let newsData = JSON.stringify(body.newsData);
        let time = body.time;
        let isUpdate = body.isUpdate;
        let files = req.files;
        let fileStr = "";
        otherData.getNews("", [new_id], (err, ret) => {
            if (err) {
                cb('error');
            } else {
                let fileStrAgo = ret[0].imgPath;
                fileStrAgo = fileStrAgo.split(';');
                // 将数据库与所有图片路径，其中这次被替换了的，进行替换。并将以前的删除
                let count = 0;
                for (let i = 0; i < isUpdate.length; i++) {
                    const num = isUpdate[i];
                    if (num == 1) {
                        if (fileStrAgo[i]) {
                            deleteFile(fileStrAgo[i])
                        }
                        fileStrAgo[i] = files[count].path.split(public.uploadFolde + symbol)[1];
                        count++;
                    }
                }
                for (let i = 0; i < fileStrAgo.length; i++) {
                    const file = fileStrAgo[i];
                    if (file) {
                        fileStr += file + ';';
                    }
                }
                let arr = [title, time, title2, newsData, fileStr, new_id];
                otherData.updateNew(arr, (err, ret) => {
                    if (err) {
                        console.log(err);
                        cb('error');
                    } else {
                        cb('success');
                    }
                })
            }
        })

    },
    /**
     * 查找新闻
     */
    getNews: function (body, cb) {
        let new_id = body.new_id;
        let otjs = {};
        otjs.limit = body.limit;
        if (!new_id) {
            new_id = "";
        }
        otherData.getNews(otjs, [new_id], (err, ret) => {
            if (err) {
                cb('error')
            } else {
                console.log(ret);
                cb(JSON.stringify({ data: ret }));
            }
        })
    },
    /**
     * 添加一条新闻
     */
    insertNew: function (req, cb) {
        let body = req.body;
        let title = JSON.stringify(body.title);
        let title2 = JSON.stringify(body.title2);
        let newsData = JSON.stringify(body.newsData);
        let time = body.time;
        let files = req.files;
        let fileStr = "";
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let filePath = file.path.split(public.uploadFolde + symbol)[1];
            fileStr += filePath + ';';
        }
        let arr = [title, time, title2, newsData, fileStr];
        otherData.insertNew(arr, (err, ret) => {
            if (err) {
                console.log(err);
                cb('error');
            } else {
                cb('success');
            }
        })

    },
    /**
     * 无须传入任何东西，直接获取表中信息
     */
    getzizhi: function (body, cb) {
        queryData.getzizhi({}, [], (err, ret) => {
            if (err) {
                debug('获取资质表的信息错误');
                cb('error')
            } else {
                cb(JSON.stringify({ 'data': ret }))
            }
        })
    },
    /**
     * 传入zizhi_id，修改内容，图片路径。
     */
    updatezizhi: function (req, cb) {
        let body = req.body;
        let zizhi_id = body.database_id;
        let text = body.text;
        let imgPath = req.files.length
        queryData.getzizhi({}, [], (err, rt) => {
            async.parallel([
                function (cb2) {
                    if (text) {
                        otherData.updatezizhiText([text, zizhi_id], (err, ret) => {
                            if (err) {
                                debug('修改资质表内容错误');
                                cb('error')
                            } else {
                                cb2(null, 'text')
                            }
                        })
                    } else {
                        cb2(null, 'text')
                    }
                },
                function (cb2) {
                    if (imgPath != 0) {
                        imgPath = req.files[0].path;
                        let imgAgoPath = rt[0].imgPath;
                        deleteFile(imgAgoPath);
                        imgPath = imgPath.split(uploadFile + symbol)[1];
                        otherData.updatezizhiImg([imgPath, zizhi_id], (err, ret) => {
                            if (err) {
                                debug('修改资质表图片错误');
                                cb('error')
                            } else {
                                cb2(null, 'img')
                            }
                        })
                    } else {
                        cb2(null, 'img')
                    }
                }
            ], function (err, result) {
                cb('success')
            })
        })
    },
    /**
     * 获取资质表的信息
     */
    get_home_page: function (body, cb) {
        queryData.gethome_page({}, [], (err, ret) => {
            if (err) {
                debug('查找首页标内容错误');
                cb('error')
            } else {
                let arr = [];
                async.eachSeries(ret, function (rt, cb2) {
                    let home_id = rt.home_id;
                    let product_id = rt.product_id;
                    if (product_id) {
                        queryOrder.getProduct({ product_id: product_id }, [product_id], (err, ret2) => {
                            arr.push({ "home_id": home_id, "product": ret2[0] })
                            cb2()
                        })
                    } else {
                        arr.push(rt);
                        cb2()
                    }
                }, function (err) {
                    cb(JSON.stringify({ "data": arr }))
                })
            }
        })
    },
    updatehome_page: function (req, cb) {
        let body = req.body;
        let product_id = body.product_id;
        let home_id = body.database_id;
        // 如果传过来的商品id有值，那就是修改商品，否则就是广告
        if (product_id) {
            otherData.updatehome_page_product([product_id, home_id], (err, ret) => {
                if (err) {
                    debug('修改首页表商品错误');
                    cb('error')
                } else {
                    cb('success')
                }
            })
        } else {
            let text = body.text;
            let imgPathLength = req.files.length
            let isUpdate = body.isUpdate;
            queryData.gethome_page({ home_id: home_id }, [home_id], (err, rt) => {
                async.parallel([
                    function (cb2) {
                        if (text) {
                            otherData.updatehome_page_ADText([text, null, home_id], (err, ret) => {
                                if (err) {
                                    debug('修改首页表内容错误');
                                    cb('error')
                                } else {
                                    cb2(null, 'text')
                                }
                            })
                        } else {
                            cb2(null, 'text')
                        }
                    },
                    function (cb2) {
                        if (imgPathLength != 0) {
                            let imgPath = null;
                            let imgPath2 = null;
                            // 获取上传图片的(req.files[count].path)
                            let count = 0;
                            // 获取传入数据库哪个字段的(imgPath,imgPath2,~~~等)
                            let count2 = 0;
                            async.eachSeries(isUpdate, function (isNum, cb3) {
                                if (isNum == 0) {
                                    cb3()
                                    count2++;
                                } else {
                                    let imgAgoPath;
                                    if (count2 == 0) {
                                        imgPath = req.files[count].path;
                                        imgAgoPath = rt[0].imgPath;
                                        imgPath = imgPath.split(uploadFile + symbol)[1];
                                    } else if (count2 == 1) {
                                        imgPath2 = req.files[count].path;
                                        imgAgoPath = rt[0].imgPath2;
                                        imgPath2 = imgPath2.split(uploadFile + symbol)[1];
                                    }
                                    count++;
                                    deleteFile(imgAgoPath);
                                    otherData.updatehome_page_ADImg({ "imgPath": imgPath, "imgPath2": imgPath2, "product_id": 'null' }, [imgPath, imgPath2, 'null', home_id], (err, ret) => {
                                        if (err) {
                                            debug('修改首页表图片错误');
                                            cb('error')
                                        } else {
                                            cb3();
                                        }
                                    })
                                }
                            }, function (err) {
                                cb2(null, 'img')
                            })
                        } else {
                            cb2(null, 'img')
                        }
                    }
                ], function (err, result) {
                    cb('success')
                })
            })
        }
    },
    /**
     * 获得合作伙伴表的所有信息
     */
    getbusiness: function (body, cb) {
        queryData.getbusiness({}, [], (err, ret) => {
            if (err) {
                debug('获得合作伙伴表信息错误');
                cb('error')
            } else {
                cb(JSON.stringify({ "data": ret }))
            }
        })
    },
    /**
     * 传入bus_id(业务id)以及类型id获得对应银行
     */
    getPartnerBank: function (body, cb) {
        let bus_id = body.bus_id;
        let twoLine = body.twoLine;
        let partner_id = body.partner_id;
        queryData.getpartner({ bus_id: bus_id, twoLine: twoLine, partner_id: partner_id }, [bus_id, twoLine, partner_id], (err, ret) => {
            if (err) {
                debug('获取银行或者机构信息出现错误');
                cb('error')
            } else {
                cb(JSON.stringify({ "data": ret }))
            }
        })
    },
    updatebusinessAndPartner: function (req, cb) {
        let body = req.body;
        let bus_id = body.database_id;
        let name = body.name;
        let select_arr = body.select;   // 哪个需要修改银行图标路径
        let partner_id_arr = body.partner_id;   // 对应的表的id
        let small_text_arr = body.small_text    // id对应的小文字
        // 先修改伙伴表对应的名字
        otherData.updatebusiness([name, bus_id], (err, ret1) => {
            let count1 = 0;
            let count2 = 0;
            let jsonObj = [];
            async.eachSeries(select_arr, function (select, cb2) {
                let partner_id = partner_id_arr[count1];
                let small_text = small_text_arr[count1];
                if (select == 1) {
                    // 查询原表中的图片路径删除掉
                    queryData.getpartner({ "partner_id": partner_id }, [partner_id], (err, ret2) => {
                        if (err) {
                            debug('查询银行表中图片出现错误')
                            cb('error')
                        } else {
                            let imgAgoPath = ret2[0].bank_imgPath;
                            let imgPath = req.files[count2].path;
                            if (imgAgoPath && imgAgoPath != "") {
                                deleteFile(imgAgoPath);
                            }
                            imgPath = imgPath.split(uploadFile + symbol)[1];
                            otherData.updatebusinessSmallTextAndBankImg([small_text, imgPath, partner_id], (err, ret3) => {
                                if (err) {
                                    debug('修改银行伙伴表的小图片和小内容出现错误');
                                    cb('error')
                                } else {
                                    count1++;
                                    count2++;
                                    cb2()
                                }
                            })
                        }
                    })
                } else {
                    otherData.updatebusinessSmallText([small_text, partner_id], (err, ret2) => {
                        if (err) {
                            debug('修改银行伙伴表的小内容出现错误');
                            cb('error')
                        } else {
                            count1++;
                            cb2()
                        }
                    })
                }
            }, function (err) {
                cb('success')
            })
        })
    },
    updatepartnerDetail: function (req, cb) {
        let body = req.body;
        let partner_id = body.database_id;
        let name = body.name
        let big_text = body.text;
        let imgPath = req.files.length
        queryData.getpartner({ "partner_id": partner_id }, [partner_id], (err, ret) => {
            if (err) {
                debug('查询银行表中详细图片出现错误');
                cb('error')
            } else {
                if (imgPath != 0) {
                    let imgAgoPath = ret[0].bank_imgPath;
                    imgPath = req.files[0].path;
                    deleteFile(imgAgoPath);
                    imgPath = imgPath.split(uploadFile + symbol)[1];
                    otherData.updatepartnerDetail({ "name": name, "big_text": big_text, "imgPath": imgPath }, [name, big_text, imgPath, partner_id], (err, ret2) => {
                        if (err) {
                            debug('修改银行表中详细图片出现错误');
                            cb('error')
                        } else {
                            cb('success')
                        }
                    })
                } else {
                    otherData.updatepartnerDetail({ "name": name, "big_text": big_text }, [name, big_text, imgPath, partner_id], (err, ret2) => {
                        if (err) {
                            debug('修改银行表中详细信息出现错误');
                            cb('error')
                        } else {
                            cb('success')
                        }
                    })
                }
            }
        })
    },
}

// 判断文件路径是否存在，如果存在将这个路径删除掉
function deleteFile(imgAgoPath) {
    let pathStr = path.join(__dirname, '../public/' + uploadFile + '/' + imgAgoPath);
    if (fs.existsSync(pathStr)) {
        fs.unlinkSync(pathStr)
    }
}