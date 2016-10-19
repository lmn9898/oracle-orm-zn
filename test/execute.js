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
    orm.execute('select table_name from user_tables',[],{maxRows: 2}).then(function(r){
        console.log(r);
    }).catch(function(e){
        console.log(e)
    });
}).catch(function(e){
    console.log('init:'+e)
});