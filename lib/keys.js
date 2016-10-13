/**
 * Created by lmn on 10/8/16.
 */
module.exports = function(obj){
    var _list = [];
    if(typeof(obj) == 'object') {
        for(var key in obj) _list.push(key);
    }
    return _list;
};