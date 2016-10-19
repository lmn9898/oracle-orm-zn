/**
 * Created by lmn on 10/8/16.
 */
var orm = {};
orm.INTEGER= 'number(11)';
orm.FLOAT= 'number';
orm.STRING= 'varchar2(255)';
orm.DATE= 'date';
var keysOfObj = require('./keys.js');

var valueToSqlStr = function(type, value){
    var res = 'null';
    if (type == orm.INTEGER) {
        res = (isNaN(value) ? 0 : parseInt(value));
    } else if (type == orm.FLOAT) {
        res = (isNaN(value) ? 0 : parseFloat(value));
    } else if (type == orm.STRING) {
        res = "'" + value + "'";
    } else if (type == orm.DATE) {
        res = "to_date('" + dateformat('yyyy-MM-dd hh:mm:ss', new Date(value)) + "','yyyy-mm-dd hh24:mi:ss')";
    }
    return res;
};

var whereObjToSqlStr = function(obj, col_def, table_name){
    var res = '';
    var makeStr = function(key, value){
        var _key = table_name? (table_name+'.'+key) : key;
        if( !value || !key ) return '';
        var res = '',  _value = '', _keys = keysOfObj(value);
        if(_keys.length == 0) {
            _value = valueToSqlStr(col_def[key],value);
            if(_value == 'null') return '';
            return _key+'='+_value;
        }
        for(var col in value){
            _value = '';
            switch (col){
                case '$in':{
                    if(!value[col].length) return '';
                    for(var i= 0,l=value[col].length;i<l;i++){
                        var _val = valueToSqlStr(col_def[key],value[col][i]);
                        if(_val == 'null') return '';
                        _value += _val + ',';
                    }
                    _value = _value.substring(0,_value.length-1);
                    res += _key+' in ('+_value+')';
                    break;
                }
                case '$notin':{
                    if(!value[col].length) return '';
                    for(var i= 0,l=value[col].length;i<l;i++){
                        var _val = valueToSqlStr(col_def[key],value[col][i]);
                        if(_val == 'null') return '';
                        _value += _val + ',';
                    }
                    _value = _value.substring(0,_value.length-1);
                    res += _key+' not in ('+_value+')';
                    break;
                }
                case '$like':{
                    if(col_def[key] == orm.STRING){
                        res += _key +" like '%"+value[col]+"%'"
                    }else{
                        _value = valueToSqlStr(col_def[key],value[col]);
                        if(_value == 'null') return '';
                        res += _key+'='+_value;
                    }
                    break;
                }
                case '$between':{
                    if(!value[col].length || value[col].length!=2) return '';
                    res += _key+' between '+valueToSqlStr(col_def[key],value[col][0])
                        +' and '+valueToSqlStr(col_def[key],value[col][1]);
                    break;
                }
                case '$notbetween':{
                    if(!value[col].length || value[col].length!=2) return '';
                    res += _key+' not between '+valueToSqlStr(col_def[key],value[col][0])
                        +' and '+valueToSqlStr(col_def[key],value[col][1]);
                    break;
                }
                case '$gt':{
                    _value = valueToSqlStr(col_def[key],value[col]);
                    if(_value == 'null') return '';
                    res += _key+'>'+_value;
                    break;
                }
                case '$gte':{
                    _value = valueToSqlStr(col_def[key],value[col]);
                    if(_value == 'null') return '';
                    res += _key+'>='+_value;
                    break;
                }
                case '$lt':{
                    _value = valueToSqlStr(col_def[key],value[col]);
                    if(_value == 'null') return '';
                    res += _key+'<'+_value;
                    break;
                }
                case '$lte':{
                    _value = valueToSqlStr(col_def[key],value[col]);
                    if(_value == 'null') return '';
                    res += _key+'<='+_value;
                    break;
                }
                case '$ne':{
                    _value = valueToSqlStr(col_def[key],value[col]);
                    if(_value == 'null') return '';
                    res += _key+'!='+_value;
                    break;
                }
                default : {
                    res += _key+' is not null';
                    break;
                }
            }
            res += ' and ';
        }
        return res.substring(0,res.length-4);

    };
    var makeOr = function(list){
        if(!list) return '';
        var _res = ' ( ';
        for(var i= 0,l=list.length; i<l ; i++){
            var obj = list[i];
            if(obj.$$and){
                _res += makeAnd(obj.$$list);
            }else if(obj.$$or) {
                _res += makeOr(obj.$$list);
            }else {
                for(var col in obj){
                    _res += makeStr(col,obj[col]);
                }
            }
            if(i+1<l) _res += ' or ';
        }
        return _res + ') '
    };
    var makeAnd = function(list){
        if(!list) return '';
        var _res = ' ( ';
        for(var i= 0,l=list.length; i<l ; i++){
            var obj = list[i];
            if(obj.$$and){
                _res += makeAnd(obj.$$list);
            }else if(obj.$$or) {
                _res += makeOr(obj.$$list);
            }else {
                for(var col in obj){
                    _res += makeStr(col,obj[col]);
                }
            }
            if(i+1<l) _res += ' and ';
        }
        return _res + ') '
    };

    if(obj.$$and){
        res += makeAnd(obj.$$list);
    }else if(obj.$$or) {
        res += makeOr(obj.$$list);
    }else {
        for(var col in obj){
            res += makeStr(col,obj[col]) + ' and ';
        }
        if(res == '') res = '1=1';
        else res = res.substring(0,res.length-4);
    }

    return  res;
};

module.exports = {
    valueToSqlStr: valueToSqlStr,
    whereObjToSqlStr: whereObjToSqlStr
}