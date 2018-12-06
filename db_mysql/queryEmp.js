let get = require('./sql')

module.exports = {
    /**
     * 查出所有的用户
     * 返回id与对应的名字
     */
    getEmpIdAndName: function (data, arr, callback) {
        let sql = "select emp_id,name,iiuv from emp t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 仅用于订单创建时，查询业务和经理的id
     * @param {Array} arr [iiuv,type1,type2]
     */
    getEmpId: function (arr, callback) {
        let sql = "select emp_id from emp where iiuv = ? and type!=6";
        get.getData(sql, arr, callback);
    },
    getEmpNotUser6: function (callback) {
        let sql = "select * from emp where type!=6";
        get.getData(sql, [], callback);
    },
    /**
     * 查询用户表
     */
    getEmp: function (data, arr, callback, limit) {
        let sql = "select * from emp t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' order by registTime desc';
        if (limit && limit != "") {
            sql += ' limit ' + (limit - 1) * 15 + ',15';
        }
        get.getData(sql, arr, callback);
    },
    /**
     * 查询部门表
     */
    getDep: function (data, arr, callback) {
        let sql = "select * from dep t where 1=1"
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询角色
     */
    getRole: function (data, arr, callback) {
        let sql = 'select * from role t where 1=1'
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询权限资源
     */
    getResource: function (data, arr, callback) {
        let sql = "select * from resource t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询角色与权限中间表
     */
    getRoleResource: function (data, arr, callback) {
        let sql = "select * from relation_role_resource t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 查询个人与权限中间表
     * @param {JSON} data - 要查询的条件字段名与对应的值
     * @param {Array} arr - 实际要传递的参数 
     * @callback callback 
     */
    getEmpResource: function (data, arr, callback) {
        let sql = "select * from relation_emp_resource t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 获得所有的未被分配的员工
     * @param {JSON} data - 要查询的条件字段名与对应的值
     * @param {Array} arr - 实际要传递的参数 
     * @callback callback 
     */
    getAllEmpNotAllot: function (data, arr, callback) {
        let sql = 'select * from emp t where ISNULL(dep_id)';
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },





    /**   针对筛选页面根据角色不同，查询不同的员工的方法 */
    /**
     * 多表查询，查询内勤名下的所有业务
     * @param {Array} arr - 内勤id
     * @callback callback 
     */
    getOffBusName: function (arr, callback) {
        let sql = 'select name,emp_id,iiuv from relation_product_dep t,emp t2 where t.dep_emp_id = t2.emp_id and t.off_id = ?';
        get.getData(sql, arr, callback);
    },
    /**
     * 多表查询，查询业务对应的所有内勤
     * @param {Array} arr - 业务id
     * @callback callback 
     */
    getBusNameId: function (arr, callback) {
        let sql = 'select name,emp_id from relation_product_dep t,emp t2 where t.off_id = t2.emp_id and t.dep_emp_id = ?';
        get.getData(sql, arr, callback);
    },
    getDepUsers: function (arr, callback) {
        let sql = 'select name,emp_id from emp t where t.iiuv=? and type=?';
        get.getData(sql, arr, callback);
    }
}

function isEmpty(arr) {
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != "" && arr[i]) {
            arr2.push(arr[i]);
        }
    }
    return arr2;
}

function isExist(sql, data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
        let value = data[keys[i]];
        if (keys[i] == 'time1') {
            sql += ' and t.appliTime>?'
        } else if (keys[i] == 'time2') {
            sql += ' and t.appliTime<?'
        } else if (value != '' && value) {
            sql += ' and t.' + keys[i] + '=?'
        }
    }
    return sql;
}