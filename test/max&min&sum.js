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
    var test = orm.define('test',{
        name: {
            type: orm.STRING,
            length: 30
        },
        age: orm.INTEGER,
        remark: orm.DATE
    },{
        indexes: [{
            fields: ['id','name']
        },{
            name: 'index_name_test',
            fields: ['name']
        }],
        sequence: true
    });
    var inform = orm.define('inform',{
        name: orm.STRING,
        address: orm.STRING
    });
    var address = orm.define('address',{
        addressId: orm.STRING,
        privence: orm.INTEGER,
        city: orm.INTEGER,
        district: orm.INTEGER,
        detail: orm.STRING
    });
    orm.sync().then(function(){
        //test.max('id',{
        //test.min('id',{
        test.sum('id',{

        }).then(function(r){
            console.log('Max&min&sum test result:');
            console.log(r);
        }).catch(function(e){
            console.log('Max&min test err:');
            console.log(e);
        })
    });

}).catch(function(e){
    console.log('Init error:'+e)
});