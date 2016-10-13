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
    var inform = orm.define('inform',{
        name: orm.STRING,
        address: orm.STRING
    });
    orm.sync().then(function(){
        test.findAllandCount({
            include: [{
                model: inform,
                use: 'name',
                on: 'name',
                notRequired: true,
                attributes: ['address']
            }],
            order: 'id desc'
        }).then(function(r){
            console.log('Select test result:');
            console.log(r);
        }).catch(function(e){
            console.log('Select test err:');
            console.log(e);
        })
    });

}).catch(function(e){
    console.log('Init error:'+e)
});