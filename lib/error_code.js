/**
 * Created by lmn on 9/27/16.
 */
module.exports = {
    pool_init : function(msg){
        return {
            errorcode: 1001,
            errormsg: msg || 'Connection pool to OracleDB is failure.'
        }
    },
    lack_auth : function(msg){
        return {
            errorcode: 1002,
            errormsg: msg || 'No authority for your OracleDB server.'
        }
    },
    con_lose : function(msg){
        return {
            errorcode: 1003,
            errormsg: msg || 'Cannot get a connection from pool.'
        }
    },
    sql_execute : function(msg){
        return {
            errorcode: 1004,
            errormsg: msg || 'SQL grammar error.'
        }
    },
    lack_para : function(msg){
        return {
            errorcode: 3001,
            errormsg: msg || 'Parameter not enough.'
        }
    },
    lack_unique : function(msg){
        return {
            errorcode: 3001,
            errormsg: msg || 'Need unique value.'
        }
    }
};