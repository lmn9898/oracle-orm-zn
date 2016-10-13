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
    var inform = orm.define('inform',{
        name: orm.STRING,
        address: orm.STRING
    });
    var test = orm.define('test',{
        name: orm.STRING,
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
    orm.sync().then(function(){
        test.delete({
            where: {
                id: { $gt: 0 }
            }
        }).then(function(r){
            console.log('Delete test:');
            console.log(r);
        }).catch(function(e){
            console.log('Delete test error:');
            console.log(e);
        })
    });
}).catch(function(e){
    console.log('init:'+e)
});