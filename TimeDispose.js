

//对时间进行处理的工具


module.exports = {
    //将年月日的格式转换为毫秒数
    /**
     * 
     * @param {String} time 年月日格式的时间
     * @param {return} return 返回毫秒数的时间格式
     */
    DateTransformMS(time) {
        var t1 = new Date(time).getTime();
        return t1;
    }
}

