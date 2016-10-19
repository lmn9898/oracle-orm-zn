/**
 * Created by lmn on 16-10-19.
 */
module.exports = function(obj){
    var _list = [];
    if(typeof(obj) == 'object') {
        for(var key in obj) _list.push(key);
    }
    return _list;
};