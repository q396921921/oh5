// 这个模块是用来处理与订单有关的查询的
// 包括，商品，类型，流程，状态
let get = require('./sql')

module.exports = {
    /**
     * 查询order2订单表中的数据
     * @param {json} data 对应数据库表中的字段名，以及值,例子：{"order_id":order_id}
     * @param {Array} arr 要传入数据库的值
     * @param {function} callback 
     */
    getOrder: function (data, arr, callback) {
        let sql = "select * from order2 t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by appliTime desc';
        get.getData(sql, arr, callback);
    },
    /**
     * 获得所有未被处理的订单数量
     */
    getNoHandleOrders: function (otjs, data, arr, callback) {
        let role_type = otjs.role_type;
        let sql = "";
        if (role_type == 1 || role_type == 2 || role_type == 6) {    // 管理员 与 董事长
            sql = 'select * from order2 t where 1=1';
        } else if (role_type == 3) {  // 经理
            let userdep_id = otjs.userdep_id;
            arr.unshift(userdep_id);
            sql = 'select * from emp t1,order2 t where t1.dep_id=? and t1.emp_id=t.business_id '
        } else if (role_type == 4) {  // 内勤
            let off_id = otjs.busoff_id;
            arr.unshift(off_id);
            sql = 'select * from order2 t where t.office_id=? ';
        } else if (role_type == 5) {  // 业务
            let bus_id = otjs.busoff_id;
            arr.unshift(bus_id);
            sql = 'select * from order2 t where t.business_id=? ';
        }
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by appliTime desc';
        get.getData(sql, arr, callback);
    },
    getScreenOrderSplitPage: function (otjs, data, arr, callback) {
        let timeType = otjs.timeType;
        let limit = otjs.limit;
        let dep_id = otjs.dep_id;
        let userdep_id = otjs.userdep_id;
        let role_type = otjs.role_type;

        let str3 = "";

        if (dep_id && dep_id != '' && role_type != 3) {
            str3 = ',emp t3';
        }
        let sql = "";
        if (role_type == 1 || role_type == 2 || role_type == 6) {    // 管理员 与 董事长
            sql = 'select * from order2 t' + str3 + ' where 1=1';
        } else if (role_type == 3) {  // 经理
            let userdep_id = otjs.userdep_id;
            arr.unshift(userdep_id);

            if (dep_id != userdep_id && dep_id) {
                sql = 'select * from emp t1,order2 t where t1.dep_id=null and t1.emp_id=t.business_id';
            } else {
                sql = 'select * from emp t1,order2 t where t1.dep_id=? and t1.emp_id=t.business_id '
            }
        } else if (role_type == 4) {  // 内勤
            let off_id = otjs.busoff_id;
            arr.unshift(off_id);
            sql = 'select * from order2 t' + str3 + ' where t.office_id=? ';
        } else if (role_type == 5) {  // 业务
            let bus_id = otjs.busoff_id;
            arr.unshift(bus_id);
            sql = 'select * from order2 t' + str3 + ' where t.business_id=? ';
        }
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        if (dep_id && dep_id != '' && role_type != 3) {
            sql += ' and t3.emp_id = t.business_id and t3.dep_id = ?';
        }
        sql += ' order by t.appliTime desc';
        if (timeType == '9') {
            sql = sql.replace(/appliTime/g, 'loanTime')
        }

        if (limit && limit != '') {
            sql += ' limit ' + (limit - 1) * 10 + ',10';
        }
        get.getData(sql, arr, callback);
    },
    getOrderSplitPage: function (otjs, data, arr, callback) {
        let limit = otjs.limit;
        let role_type = otjs.role_type;
        let client = otjs.client;
        let sql = "";
        if (role_type == 1 || role_type == 2 || role_type == 6) {    // 管理员 与 董事长
            sql = 'select * from order2 t where 1=1';
        } else if (role_type == 3) {  // 经理
            if (client == 1) {
                sql = 'select * from order2 t where 1=1 ';
            } else {
                let userdep_id = otjs.userdep_id;
                arr.unshift(userdep_id);
                sql = 'select * from emp t1,order2 t where t1.dep_id=? and t1.emp_id=t.business_id ';
            }
        } else if (role_type == 4) {  // 内勤
            let off_id = otjs.busoff_id;
            arr.unshift(off_id);
            sql = 'select * from order2 t where t.office_id=? ';
        } else if (role_type == 5) {  // 业务
            let bus_id = otjs.busoff_id;
            arr.unshift(bus_id);
            sql = 'select * from order2 t where t.business_id=? ';
        }
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by appliTime desc';
        if (limit && limit != '') {
            sql += ' limit ' + (limit - 1) * 20 + ',20';
        }
        get.getData(sql, arr, callback);
    },
    /**
     * 查询product商品表中的数据
     * @param {json} data 对应数据库表中的字段名，以及值,例子：{"product_id":product_id}
     * @param {Array} arr 要传入数据库的值
     * @param {function} callback
     */
    getProduct: function (data, arr, callback, limit) {
        let sql = "select * from product t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by product_id desc'
        if (limit && limit != '') {
            sql += ' limit ' + (limit - 1) * 15 + ',15';
        }
        get.getData(sql, arr, callback);
    },
    /**
     * 查询product_type商品类型表中的数据
     * @param {json} data 对应数据库表中的字段名，以及值,例子：{"product_id":product_id}
     * @param {Array} arr 要传入数据库的值
     * @param {function} callback
     */
    getProductType: function (data, arr, callback) {
        let sql = "select * from product_type t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询订单与状态中间表
     * 得到对应的状态id，状态时间，流程时间
     */
    getOrderState: function (data, arr, callback) {
        let sql = "select * from relation_order_state t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询具体的状态表
     * 得到对应的状态名字
     */
    getStateDetail: function (data, arr, callback) {
        let sql = "select * from state_detail t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询状态与流程的中间表
     * 得到状态对应的流程id
     */
    getStateFlow: function (data, arr, callback) {
        let sql = "select * from relation_state_flow t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询流程表
     * 得到对应的流程的名字
     */
    getFlow: function (data, arr, callback) {
        let sql = "select * from flow_detail t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by leavl asc'
        get.getData(sql, arr, callback);
    },
    /**
     * 无须传入任何东西
     * 获得flow表中的id与name
     */
    getFlowNameId: function (data, arr, callback) {
        let sql = 'select * from flow t where 1=1';
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 无须传入数据
     * 获得文件类型表的名字与id
     */
    getFile_typeNameId: function (data, arr, callback) {
        let sql = 'select * from file_types_num t where 1=1';
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询流程与具体流程的中间表
     */
    getRelationFlow: function (data, arr, callback) {
        let sql = "select * from relation_flow_detail t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     *通过传入流程id，查询出对应的以leavl级别进行排序的各个具体流程
     *多表查询 
     */
    getSortFlows: function (arr, callback) {
        let sql = "select * from flow_detail t1,relation_flow_detail t2 where t2.flow_id = ? and t1.flow_detail_id = t2.flow_detail_id ORDER BY t1.leavl ASC"
        get.getData(sql, arr, callback);
    },
    /**
     *通过传入具体流程id，查询出对应的以leavl级别进行排序的各个具体状态
     *多表查询 
     */
    getSortStates: function (arr, callback) {
        let sql = "select * from state_detail t1, relation_state_flow t2 where t2.flow_detail_id = ? and t1.state_detail_id = t2.state_detail_id ORDER BY t1.leavl ASC";
        get.getData(sql, arr, callback);
    },
    /**
     * 多表查询
     * 传入具体状态的id，查询出他对应的多个具体状态
     */
    getdetailStates: function (arr, callback) {
        let sql = "select * from relation_state_flow t1,state_detail t2 where t1.flow_detail_id = ? and t1.state_detail_id = t2.state_detail_id"
        get.getData(sql, arr, callback);
    },
    /**
     * 多表查询
     * 查询出对应的数据条数，以及名字，id
     */
    getDetailFile_types: function (arr, callback) {
        let sql = "SELECT * FROM relation_file_type_detail t1, detail_file_type t2 where t1.file_type_id = ? and t1.detail_file_type_id = t2.detail_file_type_id"
        get.getData(sql, arr, callback);
    },
    /**
     * 传入具体材料id，查询中间表，判断这个具体材料是否与大材料名有关联
     */
    getRelationFile_types: function (arr, callback) {
        let sql = 'select  * from relation_file_type_detail where detail_file_type_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 查询出所有的具体文件类型
     */
    getDetailFileType: function (callback) {
        let sql = 'select * from detail_file_type';
        get.getData(sql, [], callback);
    },
    /**
     * 查询一个总利润值
     * @param {function} callback 
     */
    getProfit: function (callback) {
        let sql = 'select * from total_profit';
        get.getData(sql, [], callback);
    },
    /**
     * 通过商品id，查询与此商品相关联的内勤
     */
    getOffByProduct_id: function (data, arr, callback) {
        let sql = 'select * from relation_product_dep t where 1=1';
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
}


// 用来判断传过来的 arr  数据，哪个是空，如果不是空就将其加入，参与查询
function isEmpty(arr) {
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != "" && arr[i] || arr[i] === 0) {
            arr2.push(arr[i]);
        }
    }
    return arr2;
}
// 用来判断传过来的  json  对象值是否为空，为空就不拼接sql语句，然后得到最终的sql语句
function isExist(sql, data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        let value = data[keys[i]];
        if (keys[i] == 'time1') {
            sql += ' and t.appliTime>?'
        } else if (keys[i] == 'time2') {
            sql += ' and t.appliTime<?'
        } else if (value != '' && value || value === 0) {
            sql += ' and t.' + keys[i] + '=?'
        }
    }
    return sql;
}