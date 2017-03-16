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
    var test = orm.define('address');
    test.drop().then(function (res) {
        console.log(res)
    }).catch(function (e) {
        console.log('drop error:'+e)
    })

}).catch(function(e){
    console.log('Init error:'+e)
});