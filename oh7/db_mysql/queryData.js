let get = require('./sql');

// 这个是用来查询前端页面那些显示的东西的

module.exports = {
    /**
     * 获取资质表的信息
     */
    getzizhi: function (data, arr, callback) {
        let sql = "select * from data_zizhi t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 获取首页表的所有信息
     */
    gethome_page: function (data, arr, callback) {
        let sql = "select * from data_home_page t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 获取业务合作伙伴表信息
     */
    getbusiness: function (data, arr, callback) {
        let sql = "select * from data_business t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    /**
     * 获取银行表信息
     */
    getpartner: function (data, arr, callback) {
        let sql = "select * from data_partner t where 1=1";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        get.getData(sql, arr, callback);
    },
    // /**
    //  * 获取文件类型表信息
    //  */
    // getfile_type:function (data, arr, callback) {
    //     let sql = "select * from data_file_type t where 1=1";
    //     arr = isEmpty(arr);
    //     sql = isExist(sql, data);
    //     get.getData(sql, arr, callback);
    // },
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
        if (value != '' && value) {
            sql += ' and t.' + keys[i] + '=?'
        }
    }
    return sql;
}