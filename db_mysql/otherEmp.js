

// 这个是用来增删改或一些特殊查询的关于账户的模块
let get = require('./sql')


module.exports = {
    /**
     * @param {function} callback
     * 返回数据库当前最大的推荐码值
     */
    getBigIIUV: function (callback) {
        sql = 'select max(iiuv) from emp';
        get.getData(sql, [], callback);
    },
    /**
     * @param {Array} arr   [username,password,type,iiuv,regisTime]
     * 创建一个是业务员的账户（需要加推荐码）
     */
    insertUser5: function (arr, callback) {
        sql = 'insert into emp (username,password,tel,type,iiuv,registTime) values (?,?,?,?,?,?)';
        get.getData(sql, arr, callback);
    },
    /**
     * @param {Array} arr   [username,password,type,registTime]
     * 创建一个不是业务员的账户(不需要添加推荐码)
     */
    insertUser: function (arr, callback) {
        sql = 'insert into emp (username,password,tel,type,registTime) values (?,?,?,?,?)';
        get.getData(sql, arr, callback);
    },
    /**
     * 将所有人的power_type的值变为1，即对应角色权限
     */
    recoverAllreource: function (arr, callback) {
        sql = 'update emp set power_type=?'
        get.getData(sql, arr, callback);
    },
    /**
     * 删除用户对权限中间表所有信息
     */
    deleteALlEmpResource: function (arr, callback) {
        sql = 'delete from relation_emp_resource';
        get.getData(sql, arr, callback);
    },
    /**
     * 通过用户id清除此账户对应的单独权限
     */
    deleteEmpResource: function (arr, callback) {
        sql = 'delete from relation_emp_resource where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 通过用户id清除此账户
     */
    deleteUser: function (arr, callback) {
        sql = 'delete from emp where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 修改一个角色的权限
     */
    insertRoleResource: function (arr, callback) {
        sql = 'insert into relation_role_resource (role_id,resource_id) values (?,?)'
        get.getData(sql, arr, callback);
    },
    /**
     * 通过角色id，删除中间表此角色id对应的所有权限
     */
    deleteRoleResource: function (arr, callback) {
        sql = 'delete from relation_role_resource where role_id=?'
        get.getData(sql, arr, callback);
    },
    /**
     * 通过用户id，将对应用户的权限类型修改为个人级别
     * @param {Array} arr   [power_type,emp_id]
     */
    updateUserPower_type: function (arr, callback) {
        sql = 'update emp set power_type=? where emp_id=?'
        get.getData(sql, arr, callback);
    },
    /**
     * 通过账户id删除账户对权限中间表的权限信息
     */
    deleteUserResource: function (arr, callback) {
        sql = 'delete from relation_emp_resource where emp_id=?'
        get.getData(sql, arr, callback);
    },
    /**
     * 修改一个用户的权限
     * [emp_id,resource_id]
     */
    insertUserResource: function (arr, callback) {
        sql = 'insert into relation_emp_resource (emp_id,resource_id) values (?,?)'
        get.getData(sql, arr, callback);
    },
    /**
     * 传入用户id
     * 恢复一个用户的权限 
     */
    recoverPower: function (arr, callback) {
        sql = 'update emp set power_type=1 where emp_id=?';
        get.getData(sql, arr, callback);
    },
    updateUserInfo: function (arr, password, callback) {
        if (password && password != "") {
            arr = [password].concat(arr);
            sql = 'update emp set password=?,name=?,tel=?,idCard=?,username=? where username=?'
        } else {
            sql = 'update emp set name=?,tel=?,idCard=?,username=? where username=?'
        }
        get.getData(sql, arr, callback);
    },
    /**
     * 传入推荐码与emp_id修改推荐码
     */
    updateUser6: function (arr, callback) {
        let sql = 'update emp set iiuv=? where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入最后提交时间，与渠道id，修改
     */
    updateSumbitTime: function (arr, callback) {
        let sql = 'update emp set submitTime=? where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入部门名字，创建一个部门
     */
    createDep: function (arr, callback) {
        sql = 'insert into dep (managerName) value (?)';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入部门id与用户id，将此员工分配到相应部门
     */
    allotUser: function (arr, callback) {
        sql = 'update emp set dep_id=? where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入部门id与用户id，将此员工分从部门删除
     */
    deleteDepUser: function (arr, callback) {
        sql = 'update emp set dep_id=null where emp_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入部门id，删除此部门 
     */
    deleteDep: function (arr, callback) {
        sql = 'delete from dep where dep_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 为部门分配正副经理
     * 或者删除部门正或副经理（置为空即可）
     */
    allotManager: function (num, arr, callback) {
        let sql = '';
        if (num == 1) {
            sql = 'update dep set manager_id=? where dep_id=?'
        } else if (num == 2) {
            sql = 'update dep set manager2_id=? where dep_id=?'
        } else if (num == 3) {
            sql = 'update dep set manager3_id=? where dep_id=?'
        }
        get.getData(sql, arr, callback);
    },
}
