var mysql = require("./pool");
var debug = require('debug')('app:server');

exports.getData = function (sql, arr, callback) {
    debug(`sql:${sql}`);
    debug(`arr:${arr}`);
    mysql.getConn(sql, arr, (err, result) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, result);
    })
}

