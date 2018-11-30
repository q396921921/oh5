// 这个是用来修改前端页面那些显示的东西的
let get = require('./sql');

module.exports = {
    /**
     * 传入要修改的图片路径，和对应id修改
     */
    updatezizhiImg: function (arr, callback) {
        let sql = "update data_zizhi set imgPath=? where zizhi_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入要修改的文字内容，和对应id修改
     */
    updatezizhiText: function (arr, callback) {
        let sql = "update data_zizhi set text=? where zizhi_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入商品id以及uid，修改对应商品
     */
    updatehome_page_product: function (arr, callback) {
        let sql = "update data_home_page set product_id=? where home_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入图片路径以及uid，修改广告
     */
    updatehome_page_ADImg: function (data, arr, callback) {
        // let sql = "update data_home_page set imgPath=?,imgPath2=?,product_id=? where home_id=?";
        let sql = "update data_home_page set ";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' where home_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 传入内容以及uid，修改广告
     */
    updatehome_page_ADText: function (arr, callback) {
        let sql = "update data_home_page set text=?,product_id=? where home_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入business_id与name修改合作伙伴表的name值
     */
    updatebusiness: function (arr, callback) {
        let sql = "update data_business set bus_name=? where bus_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入small_text与bank_imgPath以及对应的uid修改银行表中的小图标和小文字
     */
    updatebusinessSmallTextAndBankImg: function (arr, callback) {
        let sql = "update data_partner set small_text=?,bank_imgPath=? where partner_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入small_text以及对应的uid修改银行表中的小文字
     */
    updatebusinessSmallText: function (arr, callback) {
        let sql = "update data_partner set small_text=? where partner_id=?";
        get.getData(sql, arr, callback);
    },
    /**
     * 传入name
     */
    updatepartnerDetail: function (data, arr, callback) {
        let sql = "update data_partner set ";
        arr = isEmpty(arr);
        sql = isExist(sql, data);
        sql += ' where partner_id=?';
        get.getData(sql, arr, callback);
    },





    /**
     * 增加一条新闻
     */
    insertNew: function (arr, callback) {
        let sql = 'insert into news (title,time,title2,newsData,imgPath,imgPath2) values (?,?,?,?,?,?)';
        get.getData(sql, arr, callback);
    },
    /**
     * 获得新闻
     */
    getNews: function (otjs, arr, callback) {
        let limit = otjs.limit;
        let sql = "";
        if (arr[0]) {
            sql = 'select * from news where new_id=? order by new_id desc';
        } else {
            sql = 'select * from news order by new_id desc';
        }
        if (limit && limit != '') {
            sql += ' limit ' + (limit - 1) * 15 + ',15';
        }
        get.getData(sql, arr, callback);
    },
    /**
     * 修改一条新闻
     */
    updateNew: function (arr, callback) {
        let sql = 'update news set title=?,time=?,title2=?,newsData=?,imgPath=?,imgPath2=? where new_id=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 删除一条新闻
     */
    deleteNew: function (arr, callback) {
        let sql = 'delete from news where new_id=?';
        get.getData(sql, arr, callback);
    },


    /**
     * 数据
     */
    selectLoanData: function (arr, callback) {
        let sql = 'SELECT sum(money) FROM order2 where loanTime>=? and loanTime<=?';
        get.getData(sql, arr, callback);
    },
    selectDealData: function (arr, callback) {
        let sql = 'SELECT count(*) FROM order2 where order_type=1 and money is not null and loanTime is not null and loanTime>=? and loanTime<=?;'
        get.getData(sql, arr, callback);
    },
    selectcallData: function (arr, callback) {
        let sql = 'SELECT count(*) FROM order2 where order_type=2 and loanTime>=? and loanTime<=?';
        get.getData(sql, arr, callback);
    },
    selectEmpData: function (arr, callback) {
        let sql = 'SELECT count(*) FROM emp where type=6 and registTime>=? and registTime<=?';
        get.getData(sql, arr, callback);
    },
    /**
     * 获得增长基数与指数
     */
    getDataAB: function (callback) {
        let sql = 'select * from total_profit';
        get.getData(sql, [], callback);
    },
    /**
     * 修改增长基数与指数
     */
    updateDataAB: function (arr, callback) {
        let sql = 'update total_profit set loanA=?,loanB=?,dealA=?,dealB=?,callA=?,callB=?,empA=?,empB=?';
        get.getData(sql, arr, callback);
    }
}

function isEmpty(arr) {
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == 'null') {
            arr2.push(null);
        } else if (arr[i] != "" && arr[i]) {
            arr2.push(arr[i]);
        }
    }
    return arr2;
}

function isExist(sql, data) {
    let keys = Object.keys(data);
    let count = 0;
    for (let i = 0; i < keys.length; i++) {
        let value = data[keys[i]];
        if (value != '' && value && count == 0) {
            sql += keys[i] + '=?'
            count++;
        } else if (value != '' && value) {
            sql += ',' + keys[i] + '=?'
            count++;
        }
    }
    return sql;
}