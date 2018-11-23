var fs = require('fs');
var url = require('url')
var qs = require('querystring');
var queryEmp = require('./../db_mysql/queryEmp')
var otherEmp = require('./../db_mysql/otherEmp')
var async = require('async')
var momoent = require('moment');
var xlsx = require('node-xlsx');
var path = require('path');
var timer = require('./timer');
var debug = require('debug')('app:server');
var public = require('./../public/public');
var excelFile = public.excelFile;

module.exports = {
    /**
     * 删除部门正或副经理
     * 传入正或副经理部门表对应的字段，以及账户id，以及部门id
     */
    deleteManager: function (body, cb) {
        let emp_id = body.emp_id;
        let dep_id = body.dep_id;
        let name = body.name;
        if (name == 'manager_id') {
            otherEmp.allotManager(1, [null, dep_id], (err, ret) => {
                if (err) {
                    debug('删除正经理错误');
                    cb('error')
                } else {
                    deleteDepUser();
                }
            })
        } else if (name == 'manager2_id') {
            otherEmp.allotManager(2, [null, dep_id], (err, ret) => {
                if (err) {
                    debug('删除副经理错误');
                    cb('error')
                } else {
                    deleteDepUser();
                }
            })
        } else if (name == 'manager3_id') {
            otherEmp.allotManager(3, [null, dep_id], (err, ret) => {
                if (err) {
                    debug('删除正经理错误');
                    cb('error')
                } else {
                    deleteDepUser();
                }
            })
        }
        function deleteDepUser() {
            otherEmp.deleteDepUser([emp_id], (err, ret2) => {
                if (err) {
                    debug('删除用户所对应部门错误');
                    cb('error')
                } else {
                    cb('success')
                }
            })
        }
    },
    /**
     * 传入部门id并删除此部门
     */
    deleteDep: function (body, cb) {
        let dep_id = body.dep_id;
        queryEmp.getEmp({ dep_id: dep_id }, [dep_id], (err, ret) => {
            if (err) {
                debug('删除部门时，查询部门中是否还有人错误');
                cb('error')
            } else {
                if (ret.length != 0) {
                    cb('empExist')
                } else {
                    otherEmp.deleteDep([dep_id], (err, ret2) => {
                        if (err) {
                            debug('删除部门时错误');
                            cb('error')
                        } else {
                            cb('success')
                        }
                    })
                }
            }
        })
    },
    /**
     * 传入账户id的数组，与部门id，将此账户从部门中删除
     */
    deleteDepUser: function (body, cb) {
        let emp_id_arr = body.emp_id_arr;
        async.each(emp_id_arr, function (emp_id, cb2) {
            otherEmp.deleteDepUser([emp_id], (err, ret2) => {
                if (err) {
                    debug('将用户从部门删除时错误');
                    cb('error')
                } else {
                    cb2();
                }
            })
        }, function (err) {
            cb('success');
        })
    },
    /**
     * 传入账户id，正副经理字段，以及部门id。
     * 为部门分配经理
     */
    allotManager: function (body, cb) {
        let emp_id = body.emp_id;
        let dep_id = body.dep_id;
        let name = body.name;
        queryEmp.getDep({ dep_id: dep_id }, [dep_id], (err, ret) => {
            if (err) {
                debug('分配经理时，查询部门表下的经理id错误');
                cb('error')
            } else {
                if (name == 'manager_id') {
                    if (emp_id == ret[0].manager_id) {
                        cb('success')
                    } else {
                        getEmpNotAllot(1);
                    }
                } else if (name == 'manager2_id') {
                    if (emp_id == ret[0].manager2_id) {
                        cb('success')
                    } else {
                        getEmpNotAllot(2);
                    }
                } else {
                    if (emp_id == ret[0].manager3_id) {
                        cb('success')
                    } else {
                        getEmpNotAllot(3);
                    }
                }
            }
            function getEmpNotAllot(num) {
                queryEmp.getAllEmpNotAllot({ emp_id, emp_id }, [emp_id], (err, ret2) => {
                    if (err) {
                        debug('在为部门分配经理查询该账户是否已在其他部门错误');
                        cb('error')
                    } else {
                        if (ret2.length == 0) {
                            cb('userexist');
                        } else {
                            otherEmp.allotUser([dep_id, emp_id], (err, ret3) => {
                                if (err) {
                                    debug('将用户分配给部门时错误');
                                    cb('error')
                                } else {
                                    otherEmp.allotManager(num, [emp_id, dep_id], (err, ret) => {
                                        if (err) {
                                            debug('为部门分配正副经理错误');
                                            cb('error');
                                        } else {
                                            cb('success');
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        })
    },
    /**
     * 传入部门id，与员工id
     * 将相应的员工分配到相应的部门
     */
    allotUser: function (body, cb) {
        let dep_id = body.dep_id;
        let emp_id_arr = body.emp_id_arr;

        async.each(emp_id_arr, function (emp_id, cb2) {
            queryEmp.getAllEmpNotAllot({ emp_id, emp_id }, [emp_id], (err, ret) => {
                if (err) {
                    debug('在为部门分配员工时，查询员工是否已经有部门了错误');
                    cb('error')
                } else {
                    if (ret.length == 0) {
                        cb('userexist');
                    } else {
                        otherEmp.allotUser([dep_id, emp_id], (err, ret2) => {
                            if (err) {
                                debug('将用户分配给部门时错误');
                                cb('error')
                            } else {
                                cb2();
                            }
                        })
                    }
                }
            })
        }, function (err) {
            cb('success');
        })
    },
    /**
     * 无须传入数据，获得未被分配的员工
     */
    getAllEmpNotAllot: function (body, cb) {
        let type = body.type;
        queryEmp.getAllEmpNotAllot({ type: type }, [type], (err, ret) => {
            if (err) {
                debug('查询未被分配的员工时出现错误');
                cb('error')
            } else {
                cb(JSON.stringify({ "data": ret }));
            }
        })
    },
    /**
     * 获取所有部门
     */
    getAllDep: function (body, cb) {
        queryEmp.getDep({}, [], (err, ret) => {
            if (err) {
                debug('查询所有部门出现错误');
                cb('error')
            } else {
                cb(JSON.stringify({ data: ret }));
            }
        })
    },
    /**
     * 传入部门名字，创建一个部门
     */
    createDep: function (body, cb) {
        let managerName = body.managerName;
        otherEmp.createDep([managerName], (err, ret) => {
            if (err) {
                debug('创建一个新的部门错误');
                cb('error')
            } else {
                cb('success')
            }
        })
    },
    /**
     * 传入用户id
     * 删除此账户
     */
    deleteUser: function (body, cb) {
        let emp_id = body.emp_id;
        otherEmp.deleteEmpResource([emp_id], (err, ret1) => {
            if (err) {
                debug('删除账户时，删除与其关联的表');
                cb('error')
            } else {
                otherEmp.deleteUser([emp_id], (err, ret) => {
                    if (err) {
                        debug('删除此账户出现错误');
                        cb('error')
                    } else {
                        cb('success')
                    }
                })
            }
        })
    },
    /**
     * 传入用户id
     * 使用户对应权限为角色
     */
    recoverPower: function (body, cb) {
        let emp_id = body.emp_id;
        otherEmp.deleteEmpResource([emp_id], (err, ret1) => {
            if (err) {
                debug('通过用户id删除账户权限中间表时出现错误');
                cb('error')
            } else {
                otherEmp.recoverPower([emp_id], (err, ret2) => {
                    if (err) {
                        debug('使用户权限对应为角色时出现错误');
                        cb('error')
                    } else {
                        cb('success')
                    }
                })
            }
        })
    },
    /**
     * 通过emp_id或username获得用户
     */
    getEmp: function (body, cb) {
        let emp_id = body.emp_id;
        let username = body.username;
        let type = body.type;
        let dep_id = body.dep_id;
        queryEmp.getEmp({ dep_id: dep_id, emp_id: emp_id, username: username, type: type }, [dep_id, emp_id, username, type], (err, result) => {
            if (err) {
                debug('获取用户信息错误');
                cb();
            } else {
                cb(JSON.stringify({ data: result }));
            }
        })
    },
    /**
     * {username:xx,password:xx}
     * 返回成功或失败
     */
    getUserByUserPass: function (body, cb) {
        let username = body.username;
        let password = body.password;
        if (password && password != "" && username && username != "") {
            queryEmp.getEmp({ username: username, password: password }, [username, password], (err, ret) => {
                if (err) {
                    debug('通过用户名与密码查询此人时出现错误');
                    cb('error')
                } else {
                    if (ret.length != 0) {
                        if (ret[0].type != 6) {
                            cb('success')
                        } else {
                            cb('user`s type is 6 not can`t login this page.')
                        }
                    } else {
                        cb('error')
                    }
                }
            })
        } else {
            cb('error')
        }
    },
    /**
     * 
     * @param {JSON} body 
     * @param {callback} cb
     * 通过传入emp_id单独得到用户的名字 
     */
    getEmpName: function (body, cb) {
        let emp_id = body.emp_id;
        let type = body.type;
        queryEmp.getEmpIdAndName({ emp_id: emp_id, type: type }, [emp_id, type], (err, ret) => {
            if (err) {
                debug('通过id获取用户的名字错误');
                cb('error')
            } else {
                cb(JSON.stringify({ "data": ret }));
            }
        })
    },
    // 通过emp_id修改用户的信息
    updateUser6: function (body, cb) {
        let emp_id = body.emp_id;
        let iiuv = body.iiuv;
        queryEmp.getEmp({ "iiuv": iiuv, "type": 5 }, [iiuv, 5], (err, ret) => {
            if (err) {
                debug('修改用户推荐码时查询用户错误');
                cb(err);
            } else {
                if (ret.length == 1) {
                    otherEmp.updateUser6([iiuv, emp_id], (err, ret2) => {
                        if (err) {
                            debug('修改用户基本信息出现错误');
                            cb('error')
                        } else {
                            cb('success')
                        }
                    })
                } else {
                    cb('nouser')
                }
            }
        })
    },
    // 修改账户的基本信息
    updateUserInfo: function (body, cb) {
        let name = body.name;
        let repassword = body.repassword;
        let username = body.username;
        let tel = body.tel;
        let idCard = body.idCard;
        otherEmp.updateUserInfo([name, tel, idCard, tel, username], repassword, (err, ret) => {
            if (err) {
                debug('修改账户基本信息出现错误');
                cb('error')
            } else {
                cb('success')
            }
        })
    },
    /**
     * 传入null
     * 返回所有角色
     */
    getRoles: function (body, cb) {
        queryEmp.getRole({}, [], (err, result) => {
            if (err) {
                debug('获取角色信息错误');
                cb();
            } else {
                cb(JSON.stringify({ data: result }));
            }
        })
    },
    /**
     * 传入json对象dep_id:xxx（部门id）
     * 返回相应的部门信息
     */
    getDep: function (body, cb) {
        let dep_id = body.dep_id;
        queryEmp.getDep({ "dep_id": dep_id }, [dep_id], (err, result) => {
            if (err) {
                debug('获取部门信息错误');
                cb();
            } else {
                cb(JSON.stringify({ result: result }));
            }
        })
    },
    /**
     * @param {JSON} body   {username:xxx}
     * @param {Function} cb (data)
     * 返回这个唯一用户名的角色信息以及推荐码
     * {data:[{},{},{}...,iiuv]}
     */
    getRole: function (body, cb) {
        let username = body.username;
        queryEmp.getEmp({ username: username }, [username], (err, rslt) => {
            let code = rslt[0].type;
            queryEmp.getRole({ code: code }, [code], (err, rst) => {
                if (err) {
                    debug('获取单个角色信息错误');
                    cb();
                } else {
                    rst.push(rslt)
                    cb(JSON.stringify({ data: rst }));
                }
            })
        })
    },
    /**
     * @param {JSON} body   {password:xxx, num:xx, code:xxx}
     * 成功返回success,失败返回error
     * 
     */
    createUser: function (body, callback) {
        let password = body.password;
        let num = body.num;
        let code = body.code;

        // 定义一个用来存储所有新账户的数组
        let userArr = [];
        // 默认随机一个用户名
        let username = Math.floor(Math.random() * 100000 + 100000);
        if (username > 1000000) {
            username = username - 100000;
        }
        // 将数量变为数组，同步遍历
        let nums = [];
        for (let i = 0; i < num; i++) {
            nums.push(i);
        }


        if (code != '4') {
            async.eachSeries(nums, function (num, callback1) {
                let bigIIUV = 100000;  //默认最小的邀请码
                async.series([
                    function (callback2) {
                        otherEmp.getBigIIUV((err, rt) => {
                            let keys = Object.keys(rt[0]);
                            let biggerIIUV = rt[0][keys[0]];
                            if (biggerIIUV > bigIIUV) {
                                bigIIUV = biggerIIUV;
                            }
                            callback2(null, 1);
                        })
                    },
                    function (callback2) {
                        async.forever(function (callback3) {
                            queryEmp.getEmp({ "username": username }, [username], (err, rslt) => {
                                if (err) {
                                    debug('判断是否有重复用户名错误');
                                    callback('error')
                                } else if (rslt.length > 0) {
                                    username = Math.floor(Math.random() * 100000 + 100000);
                                    if (username > 1000000) {
                                        username = username - 100000;
                                    }
                                    callback3()
                                } else {
                                    // 如果没有，创建这个用户
                                    otherEmp.insertUser5([username, password, username, code, ++bigIIUV, new Date()], (err, rslt2) => {
                                        if (err) {
                                            debug('创建这个用户时出现错误');
                                            callback('error')
                                        } else {
                                            userArr.push({ "username": username, "password": password, "iiuv": bigIIUV });
                                            callback3('创建完成一个');
                                        }
                                    })
                                }
                            })
                        }, function (err) {
                            callback2()
                        })
                    }

                ], function (err) {
                    callback1();
                })
            }, function (err) {
                callback(JSON.stringify({ 'userArr': userArr }));
            })
        } else {
            async.eachSeries(nums, function (num, callback1) {
                async.forever(function (callback2) {
                    queryEmp.getEmp({ "username": username }, [username], (err, rslt) => {
                        if (err) {
                            debug('判断是否有重复用户名错误');
                            callback('error')
                        } else if (rslt.length > 0) {
                            username = Math.floor(Math.random() * 100000 + 100000);
                            if (username > 1000000) {
                                username = username - 100000;
                            }
                            callback2()
                        } else {
                            // 如果没有，创建这个用户
                            otherEmp.insertUser([username, password, username, code, new Date()], (err, rslt2) => {
                                if (err) {
                                    debug('创建这个用户时出现错误');
                                    callback('error')
                                } else {
                                    userArr.push({ "username": username, "password": password, "iiuv": '' });
                                    callback2('创建完成一个');
                                }
                            })
                        }
                    })
                }, function (err) {
                    callback1()
                })
                // 这个是创建多个账户的结尾
            }, function (err, rst2) {
                callback(JSON.stringify({ 'userArr': userArr }));
            })
        }
    },
    /**
     * 通过权限类型与角色类型查找用户
     * @param {JSON} body   {power_type:xx,type:xx}
     */
    getEmpByType2: function (body, cb) {
        let power_type = body.power_type;
        let limit = body.limit;
        let type = body.type;
        queryEmp.getEmp({ "power_type": power_type, "type": type }, [power_type, type], (err, rslt) => {
            if (err) {
                debug('通过权限类型与角色类型查找用户出现错误');
                cb();
            } else {
                cb(JSON.stringify({ data: rslt }));
            }
        }, limit)
    },
    /**
     * @param {JSON} body   {role_id:xx}
     * 返回所有权限以及此角色所拥有的权限
     */
    getAllResourcesChecked: function (body, cb) {
        let id = body.id;
        let type = body.type
        queryEmp.getResource({}, [], (err, rslt) => {
            if (err) {
                debug('获取所有权限资源出现错误');
                cb()
            } else {
                if (type == 'role') {
                    queryEmp.getRoleResource({ "role_id": id }, [id], (err, rslt2) => {
                        if (err) {
                            debug('获取角色对应的资源出现问题');
                            cb()
                        } else {
                            let arr = [];
                            arr.push(rslt)
                            arr.push(rslt2);
                            cb(JSON.stringify({ data: arr }))
                        }
                    })
                } else if (type == 'user') {
                    queryEmp.getEmpResource({ emp_id: id }, [id], (err, rslt2) => {
                        if (err) {
                            debug('获取账户对应的资源出现问题');
                            cb()
                        } else {
                            let arr = [];
                            arr.push(rslt)
                            arr.push(rslt2);
                            cb(JSON.stringify({ data: arr }))
                        }
                    })
                }
            }
        })


    },
    /**
     * 将所有人的power_type的值变为1，即对应角色权限
     * null
     * 返回sucess或者rror
     */
    recoverAllreource: function (body, cb) {
        otherEmp.deleteALlEmpResource([], (err, ret1) => {
            if (err) {
                debug('删除账户权限中间表出现错误');
                cb('error')
            } else {
                otherEmp.recoverAllreource([1], (err, ret2) => {
                    if (err) {
                        debug('将权限类型改变为角色出现错误');
                        cb('error')
                    } else {
                        cb('success')
                    }
                })
            }
        })
    },
    /**
     * getEmpByType2方法与outputUsers的一个组合
     *  @param {JSON} body   {power_type:xx,type:xx}
     * 失败返回error
     * 成功返回数据
     */
    selectAndOutUsers: function (body, cb) {
        this.getEmpByType2(body, (ret) => {
            ret = JSON.parse(ret).data
            this.outputUsers(ret, (flag, data) => {
                if (flag == 'true') {
                    cb(data)
                } else {
                    cb('error')
                }
            })
        })
    },
    /**
     * @param {JSON} body
     * {role_id:xx, resource_id:[x,y,z...]}
     */
    updateRoleResource: function (body, cb) {
        let role_id = body.role_id;
        let resource_id_arr = body.resource_id
        otherEmp.deleteRoleResource([role_id], (err, result) => {
            if (err) {
                debug('清除此角色对应的权限错误');
                cb('error')
            } else {
                async.each(resource_id_arr, function (resource_id, cb2) {
                    otherEmp.insertRoleResource([role_id, resource_id], (err, ret) => {
                        if (err) {
                            debug('为此角色添加权限错误');
                            cb('error')
                        } else {
                            cb2();
                        }
                    })
                }, function (err) {
                    cb('success')
                })
            }
        })
    },
    // 通过用户id，获得他的权限
    getOneUserResource: function (body, cb) {
        let emp_id = body.emp_id;
        queryEmp.getResource({}, [], (err, rslt) => {
            if (err) {
                debug('获取所有权限资源出现错误');
                cb()
            } else {
                queryEmp.getEmp({ "emp_id": emp_id }, [emp_id], (err, ret) => {
                    let power_type = ret[0].power_type;
                    let type = ret[0].type;
                    if (power_type == 1) {
                        queryEmp.getRoleResource({ "role_id": type }, [type], (err, rslt2) => {
                            if (err) {
                                debug('获取角色对应的资源出现问题');
                                cb()
                            } else {
                                let arr = [];
                                arr.push(rslt)
                                arr.push(rslt2);
                                cb(JSON.stringify({ data: arr }))
                            }
                        })
                    } else {
                        queryEmp.getEmpResource({ emp_id: emp_id }, [emp_id], (err, rslt2) => {
                            if (err) {
                                debug('获取账户对应的资源出现问题');
                                cb()
                            } else {
                                let arr = [];
                                arr.push(rslt)
                                arr.push(rslt2);
                                cb(JSON.stringify({ data: arr }))
                            }
                        })
                    }
                })
            }
        })
    },
    /**
     * @param {JSON}   body     {emp_id:[x,y,z...],resource_id:[x,y,z...]}
     */
    updateRoleToUser: function (body, cb) {
        let emp_id_arr = body.emp_id;
        let resource_id_arr = body.resource_id
        async.each(emp_id_arr, function (emp_id, cb2) {
            async.auto({
                deleteUserResource: function (cb3) {
                    otherEmp.deleteUserResource([emp_id], (err, ret) => {
                        if (err) {
                            debug('删除用户权限中间表中用户的权限错误');
                            cb('error')
                        } else {
                            cb3(null, "1");
                        }
                    })
                },
                updatePower_type: function (cb3) {
                    otherEmp.updateUserPower_type([2, emp_id], (err, ret) => {
                        if (err) {
                            debug('修改用户表中的权限类型出现错误');
                            cb('error')
                        } else {
                            cb3(null, "2");
                        }
                    })
                },
                insertResource: ['deleteUserResource', 'updatePower_type',
                    function (ret, cb3) {
                        async.each(resource_id_arr, function (resource_id, cb4) {
                            otherEmp.insertUserResource([emp_id, resource_id], (err, ret2) => {
                                if (err) {
                                    debug('添加用户权限中间表中用户的权限错误');
                                    cb('error')
                                } else {
                                    cb4();
                                }
                            })
                        }, function (err) {
                            cb3(null, "3");
                        })
                    }]
            }, function (err, rst2) {
                cb2()
            })
        }, function (err) {
            cb('success')
        })
    },
    /**
     * @param {JSON} body   {emp_id:xxx,resource_id:[x,y,x...]}
     */
    updateUserResource: function (body, cb) {
        let emp_id = body.emp_id;
        let resource_id_arr = body.resource_id
        otherEmp.deleteUserResource([emp_id], (err, ret) => {
            if (err) {
                debug('删除个人权限时出现错误');
                cb('error')
            } else {
                async.each(resource_id_arr, function (resource_id, cb2) {
                    otherEmp.insertUserResource([emp_id, resource_id], (err, ret2) => {
                        if (err) {
                            debug('增加个人权限时出现错误');
                            cb('error')
                        } else {
                            cb2()
                        }
                    })
                }, function (err) {
                    cb('success')
                })
            }
        })
    },
    /**
     * 传入数据库查询后返回的那种数据类型【Array】，
     * 返回：成功：true。失败：false
     */
    outputUsers: function (results, callback) {
        let strArr = public.outputTitleArrUser;
        let data = [strArr];
        
        async.eachSeries(results, function (result, cb) {
            let keys = Object.keys(result);
            let arr = [];
            async.eachSeries(keys, function (k, cb2) {
                if (k == 'dep_id') {
                    getDep(result[k], (rt) => {
                        arr.push(rt);
                        cb2()
                    })
                } else if (k == 'emp_id' || k == 'password') {
                    cb2()
                } else if (k == 'gender') {
                    if (result[k] == 1) {
                        arr.push('男')
                    } else {
                        arr.push('女')
                    }
                    cb2()
                } else if (k == 'type') {
                    getRole(result[k], (rt) => {
                        arr.push(rt)
                        cb2()
                    })
                } else if (k == 'registTime' || k == 'logTime' || k == 'submitTime') {
                    let time = Date.parse(new Date(result[k]));
                    getTime(time, (rt) => {
                        arr.push(rt)
                        cb2()
                    })
                } else if (k == 'power_type') {
                    if (result[k] == 1) {
                        arr.push('否')
                    } else {
                        arr.push('是')
                    }
                    cb2('over')
                } else {
                    arr.push(result[k])
                    cb2()
                }
            }, function (err) {
                data.push(arr);
                cb()
            })
        }, function (err, rst) {
            let buffer = xlsx.build([{ name: "sheet1", data: data }]);
            let timeStr = new Date().getTime()
            let pathStr = path.join(__dirname, '../public/' + excelFile + '/' + timeStr + '.xlsx');
            fs.writeFile(pathStr, buffer, 'binary', function (err) {
                if (err) {
                    callback('false', null);
                }
                else {
                    timer.deleteExcel(pathStr)
                    callback('true', pathStr);
                }
            });
        })
    }
}

// 处理账户信息导出excel的方法
function getDep(dep_id, cb) {
    if (dep_id) {
        queryEmp.getDep({ "dep_id": dep_id }, [dep_id], (err, rst) => {
            cb(rst[0].managerName);
        })
    } else {
        cb('无')
    }
}
// 获取对应的角色名字
function getRole(role_id, cb) {
    if (role_id) {
        queryEmp.getRole({ "role_id": role_id }, [role_id], (err, rst) => {
            if (rst.length != 0) {
                cb(rst[0].name);
            } else {
                cb('无')
            }

        })
    } else {
        cb('无')
    }
}
// 获得默认的内勤或者业务的名字
function getUser(body, cb) {
    let buf_id = body.buf_id;
    let off_id = body.off_id;
    queryEmp.getEmp({ "buf_id": buf_id, "off_id": off_id }, [buf_id, off_id], (err, rst) => {
        if (rst.length > 1) {
            cb('暂无')
        } else {
            cb(rst[0].name);
        }
    })
}

function getTime(timestamp, cb) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    Y = date.getFullYear() + '-';
    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    D = date.getDate();
    if (D < 10) {
        D = '0' + D + ' '
    } else {
        D = D + ' '
    }
    h = date.getHours();
    if (h < 10) {
        h = '0' + h + ':'
    } else {
        h = h + ':'
    }
    m = date.getMinutes();
    if (m < 10) {
        m = '0' + m;
    }
    cb(Y + M + D + h + m)
}