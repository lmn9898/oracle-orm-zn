/**
 * Created by lmn on 9/27/16.
 */
var ORM = require('../lib/ORM');
var orm = new ORM();

orm.init({
    user: 'YJYJ',
    password: 'YJYJ',
    connectString: '192.168.1.4:1521/ORCL'
}).then(function(){
    var sql = "select column_name,data_type,data_length from user_tab_columns where TABLE_NAME='TEST'";//'select table_name from user_tables';
    orm.execute(sql,[],{}).then(function(r){
        console.log(r);
    }).catch(function(e){
        console.log(e)
    });
}).catch(function(e){
    console.log('init:'+e)
});