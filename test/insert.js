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
    var address = orm.define('address',{
        addressId: orm.STRING,
        privence: orm.INTEGER,
        city: orm.INTEGER,
        district: orm.INTEGER,
        detail: orm.STRING
    });

    orm.sync().then(function(){
/*        test.insert([{
            name: 123,
            remark: new Date()
        },{
            name: 124,
            remark: new Date()
        },{
            name: 125,
            remark: new Date()
        },{
            name: 126,
            remark: new Date()
        }]).then(function(r){
            console.log('Insert test result:');
            console.log(r);
        }).catch(function(e){
            console.log('Insert test err:');
            console.log(e);
        });*/
/*        inform.insert([{
            name: 123,
            address: '123'
        },{
            name: 124,
            address: '124'
        }]).then(function(r){
            console.log('Insert test result:');
            console.log(r);
        }).catch(function(e){
            console.log('Insert test err:');
            console.log(e);
        })*/
        /*address.insert([{
            addressId: '123',
            privence: 1,
            city: 2
        },{
            addressId: '124',
            privence: 4,
            city: 1
        }]).then(function(r){
            console.log('Insert test result:');
            console.log(r);
        }).catch(function(e){
            console.log('Insert test err:');
            console.log(e);
        })*/
    });

}).catch(function(e){
    console.log('init:'+e)
});

