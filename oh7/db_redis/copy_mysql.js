const db = require('./redis_conn.js');
const queryOrder = require('./../db_mysql/queryOrder');
const queryEmp = require('./../db_mysql/queryEmp');
const queryData = require('./../db_mysql/queryData');

const async = require('async');
const copy = {};
const client = db.client



/**
 * 将mysql的product表的所有数据导入redis
 */
copy.product = function (cb) {
    queryOrder.getProduct({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let flow_id = rt.flow_id;
                let product_id = rt.product_id;
                let product_type_id = rt.product_type_id;
                let name = rt.name;
                let product_intro = rt.product_intro;
                let imgPathSmall = rt.imgPathSmall;
                let imgPath = rt.imgPath;
                let imgPath2 = rt.imgPath2;
                let file_type_id = rt.file_type_id;
                let threeText = rt.threeText;
                let isNum = rt.isNum;
                let isBourse = rt.isBourse;
                let putaway = rt.putaway;
                client.hmset('product:' + product_id,
                    {
                        "flow_id": flow_id, "product_type_id": product_type_id,
                        "name": name, "product_intro": product_intro, "imgPathSmall": imgPathSmall, "imgPath": imgPath, "imgPath2": imgPath2,
                        "file_type_id": file_type_id, "threeText": threeText, "isNum": isNum, "isBourse": isBourse, "putaway": putaway
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有商品成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql商品表的所有聊天房间导入redis
 * 暂时不能用我没有这个查询方法
 */
copy.chatroom = function (cb) {

    queryOrder.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let chat_id = rt.chat_id;
                let productName = rt.productName;
                let Uname = rt.Uname;
                let Utel = rt.Utel;
                let Bname = rt.Bname;
                let Btel = rt.Btel;
                let Oname = rt.Oname;
                let Otel = rt.Otel;
                let Mname = rt.Mname;
                let Mtel = rt.Mtel;
                let chatfile = rt.chatfile;
                client.hmset('chat_id:' + chat_id,
                    {
                        "productName": productName, "Uname": Uname,
                        "Utel": Utel, "Bname": Bname, "Btel": Btel, "Oname": Oname, "Otel": Otel,
                        "Mname": Mname, "Mtel": Mtel, "chatfile": chatfile
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有聊天房间成功');
                cb('success')
            })
        }
    })
};
/**
 * 将mysql管理前端data_business表的所有数据导入redis
 */
copy.data_business = function (cb) {
    queryData.getbusiness({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let bus_id = rt.bus_id;
                let bus_name = rt.bus_name;
                client.hmset('bus_id:' + bus_id,
                    {
                        "bus_name": bus_name
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有前端合作伙伴成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的data_home_page的所有数据导入redis
 */
copy.data_home_page = function (cb) {
    queryData.data_home_page({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let home_id = rt.home_id;
                let text = rt.text;
                let imgPath = rt.imgPath;
                let imgPath2 = rt.imgPath2;
                let product_id = rt.product_id;
                client.hmset('home_id:' + home_id,
                    {
                        "text": text, "imgPath": imgPath, "imgPath": imgPath, "imgPath2": imgPath2, "product_id": product_id
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2();
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有前端banner图信息成功');
                cb('success');
            })
        }
    })
}
/**
 * 将mysql的data_partner表的所有聊天房间导入redis
 */
copy.data_partner = function (cb) {
    queryData.getpartner({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let partner_id = rt.partner_id;
                let bus_id = rt.bus_id;
                let name = rt.name;
                let big_text = rt.big_text;
                let imgPath = rt.imgPath;
                let small_text = rt.small_text;
                let bank_imgPath = rt.bank_imgPath;
                let twoLine = rt.twoLine;
                client.hmset('partner_id:' + partner_id, {
                    "bus_id": bus_id, "name": name,
                    "big_text": big_text, "imgPath": imgPath, "small_text": small_text, "bank_imgPath": bank_imgPath, "twoLine": twoLine,
                }, (err, flag) => {
                    if (err) {
                        console.log(err);
                    } else if (flag == 'OK') {
                        cb2()
                    }
                })
            }, function (err, rt) {
                console.log('复制所有银行信息成功');
                cb('success');
            })
        }
    })
}
/**
 * 将mysql的data_zizhi表的所有资质导入redis
 */
copy.data_zizhi = function (cb) {
    queryData.getzizhi({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let zizhi_id = rt.zizhi_id;
                let text = rt.text;
                let imgPath = rt.imgPath;
                client.hmset('zizhi_id:' + zizhi_id,
                    {
                        "text": text, "imgPath": imgPath,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有资质信息成功');
                cb('success');
            })
        }
    })
}
/**
 * 将mysql的部门表的所有信息导入redis
 */
copy.dep = function (cb) {
    queryEmp.getDep({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let dep_id = rt.dep_id;
                let manager_id = rt.manager_id;
                let manager2_id = rt.manager2_id;
                let manager3_id = rt.manager3_id;
                let managerName = rt.managerName;
                client.hmset('dep_id:' + dep_id,
                    {
                        "manager_id": manager_id, "manager2_id": manager2_id,
                        "manager3_id": manager3_id, "managerName": managerName
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有部门信息成功');
                cb('success');
            })
        }
    })
}
/**
 * 将mysql的detail_file_type表的所有数据导入redis
 */
copy.detail_file_type = function (cb) {
    queryOrder.getDetailFileType((err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let detail_file_type_id = rt.detail_file_type_id;
                let name = rt.name;
                let text = rt.text;
                client.hmset('detail_file_type_id:' + detail_file_type_id,
                    {
                        "name": name, "text": text,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                console.log('复制所有材料信息成功');
                cb('success');
            })
        }
    })
}
/**
 * 将mysql的product表的所有数据导入redis
 */
copy.emp = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let emp_id = rt.emp_id;
                let dep_id = rt.dep_id;
                let username = rt.username;
                let password = rt.password;
                let tel = rt.tel;
                let name = rt.name;
                let gender = rt.gender;
                let type = rt.type;
                let iiuv = rt.iiuv;
                let idCard = rt.idCard;
                let registTime = rt.registTime;
                let logTime = rt.logTime;
                let submitTime = rt.submitTime;
                let power_type = rt.power_type;
                client.hmset('emp_id:' + emp_id,
                    {
                        "dep_id": dep_id, "username": username, "password": password, "tel": tel,
                        "name": name, "gender": gender, "type": type, "iiuv": iiuv, "idCard": idCard,
                        "registTime": registTime, "logTime": logTime, "submitTime": submitTime, "power_type": power_type,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的file_types_num表的所有数据导入redis
 */
copy.file_types_num = function (cb) {
    queryOrder.getFile_typeNameId({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let file_type_id = rt.file_type_id;
                let name = rt.name;
                client.hmset('file_type_id:' + file_type_id,
                    {
                        "name": name,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有材料集合的名字成功');
                cb('success')
            })
        }
    })
}



/**
 * 将mysql的flow表的所有数据导入redis
 */
copy.flow = function (cb) {
    queryOrder.getFlow({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let flow_id = rt.flow_id;
                let flow_name = rt.flow_name;
                client.hmset('flow_id:' + flow_id,
                    {
                        "flow_name": flow_name,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有流程集合名字成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的flow_detail表的所有数据导入redis
 */
copy.flow_detail = function (cb) {
    queryOrder.getFile_typeNameId({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let flow_detail_id = rt.flow_detail_id;
                let flow_name = rt.flow_name;
                let leavl = rt.leavl;
                client.hmset('flow_detail_id:' + flow_detail_id,
                    {
                        "flow_name": flow_name, "leavl": leavl,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有流程详细成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的message表的所有数据导入redis
 */
copy.message = function (cb) {
    queryOrder.getFile_typeNameId({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let mes_id = rt.mes_id;
                let mes = rt.mes;
                let mes_state = rt.mes_state;
                let mes_result = rt.mes_result;
                let mes_time = rt.mes_time;
                client.hmset('mes_id:' + mes_id,
                    {
                        "mes": mes, "mes_state": mes_state,
                        "mes_result": mes_result, "mes_time": mes_time,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有消息通知成功');
                cb('success')
            })
        }
    })
}


/**
 * 将mysql的order表的所有数据导入redis
 */
copy.order = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let order_id = rt.order_id;
                let product_id = rt.product_id;
                let flowState = rt.flowState;
                let relation_state_id = rt.relation_state_id;
                let appli_id = rt.appli_id;
                let channel_id = rt.channel_id;
                let business_id = rt.business_id;
                let office_id = rt.office_id;
                let clientName = rt.clientName;
                let inmoney = rt.inmoney;
                let money = rt.money;
                let appliTime = rt.appliTime;
                let loanTime = rt.loanTime;
                let seeTime = rt.seeTime;
                let failReason = rt.failReason;
                let userComment = rt.userComment;
                let empComment = rt.empComment;
                let orderFile = rt.orderFile;
                let order_type = rt.order_type;
                let order_state = rt.order_state;
                let bank_name = rt.bank_name;
                let bank_id = rt.bank_id;
                let card_name = rt.card_name;
                let refund = rt.refund;
                let commend1 = rt.commend1;
                let commend2 = rt.commend2;
                let commend3 = rt.commend3;
                let commend4 = rt.commend4;
                client.hmset('order_id:' + order_id,
                    {
                        "product_id": product_id, "flowState": flowState, "relation_state_id": relation_state_id, "appli_id": appli_id,
                        "channel_id": channel_id, "business_id": business_id, "office_id": office_id, "clientName": clientName, "inmoney": inmoney,
                        "money": money, "appliTime": appliTime, "loanTime": loanTime, "seeTime": seeTime, "failReason": failReason,
                        "userComment": userComment, "empComment": empComment, "orderFile": orderFile, "order_type": order_type, "order_state": order_state,
                        "bank_name": bank_name, "bank_id": bank_id, "card_name": card_name, "refund": refund, "commend1": commend1,
                        "commend2": commend2, "commend3": commend3, "commend4": commend4,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有订单成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的product_type表的所有数据导入redis
 */
copy.product_type = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let product_type_id = rt.product_type_id;
                let name = rt.name;
                client.hmset('product_type_id:' + product_type_id,
                    {
                        "name": name,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工成功');
                cb('success')
            })
        }
    })
}
/**
 * 没有主键id
 * 将mysql的relation_emp_resource表的所有数据导入redis
 */
copy.relation_emp_resource = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let emp_id = rt.emp_id;
                let resource_id = rt.resource_id;
                client.hmset('relation_emp_resource',
                    {
                        "emp_id": emp_id, "resource_id": resource_id,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工中间权限成功');
                cb('success')
            })
        }
    })
}
/**
 * 没有主键
 * 将mysql的relation_emp_role表的所有数据导入redis
 */
copy.relation_emp_role = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let emp_id = rt.emp_id;
                let role_id = rt.role_id;
                client.hmset('relation_emp_role',
                    {
                        "role_id": role_id, "emp_id": emp_id,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有角色权限成功');
                cb('success')
            })
        }
    })
}
/**
 * 没有主键
 * 将mysql的relation_file_type_detail表的所有数据导入redis
 */
copy.relation_file_type_detail = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let file_type_id = rt.file_type_id;
                let detail_file_type_id = rt.detail_file_type_id;
                client.hmset('relation_file_type_detail',
                    {
                        "file_type_id": file_type_id, "detail_file_type_id": detail_file_type_id,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有具体材料成功');
                cb('success')
            })
        }
    })
}

/**
 * 没有主键
 * 将mysql的relation_flow_detail表的所有数据导入redis
 */
copy.relation_flow_detail = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let flow_id = rt.flow_id;
                let flow_detail_id = rt.flow_detail_id;
                client.hmset('relation_flow_detail',
                    {
                        "flow_id": flow_id, "flow_detail_id": flow_detail_id,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的relation_file_type_detail表的所有数据导入redis
 */
copy.relation_file_type_detail = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let file_type_id = rt.file_type_id;
                let detail_file_type_id = rt.detail_file_type_id;
                let username = rt.username;
                let password = rt.password;
                let tel = rt.tel;
                let name = rt.name;
                let gender = rt.gender;
                let type = rt.type;
                let iiuv = rt.iiuv;
                let idCard = rt.idCard;
                let registTime = rt.registTime;
                let logTime = rt.logTime;
                let submitTime = rt.submitTime;
                let power_type = rt.power_type;
                client.hmset('emp_id:' + emp_id,
                    {
                        "dep_id": dep_id, "username": username, "password": password, "tel": tel,
                        "name": name, "gender": gender, "type": type, "iiuv": iiuv, "idCard": idCard,
                        "registTime": registTime, "logTime": logTime, "submitTime": submitTime, "power_type": power_type,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工成功');
                cb('success')
            })
        }
    })
}
/**
 * 将mysql的relation_file_type_detail表的所有数据导入redis
 */
copy.relation_file_type_detail = function (cb) {
    queryEmp.getEmp({}, [], (err, ret) => {
        if (err) {
            console.log(err);
        } else {
            async.eachSeries(ret, function (rt, cb2) {
                let keys = Object.keys(rt);
                async.each(keys, function (key, cb3) {
                    if (!rt[key]) {
                        rt[key] = ""
                    }
                }, function (err) {
                    cb3();
                })
                let file_type_id = rt.file_type_id;
                let detail_file_type_id = rt.detail_file_type_id;
                let username = rt.username;
                let password = rt.password;
                let tel = rt.tel;
                let name = rt.name;
                let gender = rt.gender;
                let type = rt.type;
                let iiuv = rt.iiuv;
                let idCard = rt.idCard;
                let registTime = rt.registTime;
                let logTime = rt.logTime;
                let submitTime = rt.submitTime;
                let power_type = rt.power_type;
                client.hmset('emp_id:' + emp_id,
                    {
                        "dep_id": dep_id, "username": username, "password": password, "tel": tel,
                        "name": name, "gender": gender, "type": type, "iiuv": iiuv, "idCard": idCard,
                        "registTime": registTime, "logTime": logTime, "submitTime": submitTime, "power_type": power_type,
                    }, (err, flag) => {
                        if (err) {
                            console.log(err);
                        } else if (flag == 'OK') {
                            cb2()
                        }
                    })
            }, function (err, rt) {
                if (err) {
                    console.log(err);
                    cb('error')
                }
                console.log('复制所有员工成功');
                cb('success')
            })
        }
    })
}