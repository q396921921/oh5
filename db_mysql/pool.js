var mysql = require('mysql');

var pool = mysql.createPool({
    // host: 'localhost',
    host: '47.92.215.175',
    port: 3306,
    user: 'local',
    // password: '123456',
    password: 'Chaiyang007...',
    database: 'loanuser'
})

function getConn(sql, arr, callback) {
    pool.getConnection((err, conn) => {
        if (err) {
            console.log("获得连接错误")
            console.log(err);
            callback(err, null)
            return
        }
        conn.query(sql, arr, (err, result) => {
            if (err) {
                console.log("数据库出现错误?");
                console.log(err);
                callback(err, null)
                // 关闭数据库连接?
                conn.release();
                return
            }
            callback(null, result);
            conn.release();
        })
    })
}

module.exports.getConn = getConn;