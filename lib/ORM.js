/**
 * Created by LMN on 2016/9/28.
 */

var extend = require('extend');
var Q = require("q");
var db = require('oracledb');
var ecode = require('./error_code.js');
var Model = require('./MODEL');

function Oracle_ORM(_opts){
    this.pool = null;
    this.define_objs = {};
    this.INTEGER= 'number(11)';
    this.FLOAT= 'number';
    this.STRING= 'varchar2(255)';
    this.DATE= 'date';
    this.opt= {
        outFormat: db.OBJECT,
        maxRows: 1000
    };
    if(_opts) this.init(_opts);
}

Oracle_ORM.prototype.and = function(list){
    return {
        $$and: true,
        $$list: list
    };
};

Oracle_ORM.prototype.or = function(list){
    return {
        $$or: true,
        $$list: list
    };
};

Oracle_ORM.prototype.getCon = function(){
    var pro = Q.defer();
    if(this.pool){
        this.pool.getConnection(function(e,conn){
            if(e) pro.reject(ecode.con_lose(e.message));
            else pro.resolve(conn);
            return pro.promise;
        });
    }else{
        pro.reject(ecode.pool_init('Pool is not created.'));
    }
    return pro.promise;
};

Oracle_ORM.prototype.init = function(options){
    var pro = Q.defer(), self = this;
    var opt = {
        poolMax: 600,
        poolMin: 5,
        poolIncrement: 2,
        poolTimeout: 30,
        queueRequests: true,
        queueTimeout: 30000
    };
    if(!options) {
        pro.reject(ecode.lack_auth());
    }else{
        opt = extend(opt,options);
        db.createPool(opt,function(pool_error, return_pool){
            if(pool_error){
                opt.reject(ecode.pool_init(pool_error.message));
            }else{
                self.pool = return_pool;
                self.define_objs = {};
                pro.resolve('Pool Created.');
            }
        });
    }
    return pro.promise;
};

Oracle_ORM.prototype.define = function(table_name, columns, options){
    var define_obj = {
        primaryKey : null, //primary key column name
        sequence : null, //sequence column obj
        table_name : table_name,// table name
        columns_obj : {}, // table columns
        create_table : 'sql', //create table sql
        create_seq : null, //create sequence sql
        table_indexes : [], //table indexes list
        created: false,  // flag of table exist
        model: null //table model obj
    }, first_column = true;
    //make SQL for create table
    var sql = 'create table '+table_name+' ( ';
    for(var column in columns){
        if(!first_column)
            sql += ', ';
        else
            first_column = false;

        var col = columns[column];
        //column name
        var column_name = col.name || column;
        sql += column_name;
        //column data type
        var column_type = {},column_type_name = '';
        if(typeof(col) == 'string'){
            column_type_name = col;
        }else if(col.type){
            column_type_name = col.type;
        }else{
            continue;
        }
        sql += ' '+column_type_name;
        column_type = column_type_name;
        //primary key
        if(!define_obj.primaryKey && col.primaryKey){
            sql += ' constraint pk_'+define_obj.table_name+'_'+column+' primary key';
            define_obj.primaryKey = column_name;
        }
        define_obj.columns_obj[column_name] = column_type;
    }
    //sequence column
    if(options && options.sequence && !define_obj.primaryKey){
        var seq_column_name = options.sequence.name || 'id';
        sql += ', '+seq_column_name+' number(11)'+' constraint pk_'+define_obj.table_name+'_'+seq_column_name+' primary key';
        define_obj.create_seq = 'create sequence SEQ_'+table_name.toUpperCase()+' minvalue 1 maxvalue 99999999 start with 1 increment by 1 cache 20';
        define_obj.sequence = {column: seq_column_name, seq: 'SEQ_'+table_name.toUpperCase()};
        define_obj.primaryKey = seq_column_name;
        define_obj.columns_obj[seq_column_name] = this.INTEGER;
    }
    sql += ' )';
    define_obj.create_table = sql;
    //table indexes
    if(options && options.indexes){
        for(var i= 0,l= options.indexes.length;i<l;i++){
            var _obj = options.indexes[i];
            //make SQL for create index
            sql = 'create';
            if(_obj.type) sql += ' '+_obj.type;
            sql += ' index';
            var index_name = '';
            if(_obj.name) {
                index_name = _obj.name;
            }else {
                index_name = 'index_' + define_obj.table_name + '_' + _obj.fields.join('_');
            }
            sql += ' ' + index_name;
            if(!_obj.fields) continue;
            sql += ' on '+define_obj.table_name+' ('+_obj.fields.join(',')+')';
            define_obj.table_indexes.push({
                sql : sql,
                fields : _obj.fields,
                unique: (_obj.type&&_obj.type.toLowerCase() == 'unique')?true: false
            });
        }
    }
    //push table defination in list
    this.define_objs[define_obj.table_name] = define_obj;
    define_obj.model = new Model(table_name,this);
    return define_obj.model;
};

Oracle_ORM.prototype.sync = function(){
    var self = this, _promise = Q.defer();
    self.getCon().then(function(con){//get all user tables
        var pro = Q.defer();
        con.execute('select table_name from user_tables',{},self.opt,function(e,r){
            if(e) pro.reject({c:con,e:ecode.sql_execute('select all tables: '+e.message)});
            else pro.resolve({
                con: con,
                rows: r.rows
            });
        });
        return pro.promise;
    }).then(function(result){//create table which is not exist
        var con = result.con, names = result.rows;
        var _pro = Q.defer();
        var exist_tables = {};
        for(var i= 0,l=names.length;i<l;i++){
            exist_tables[names[i].TABLE_NAME] = true;
        }
        var create_indexes = [],create_tables = [],create_sequences = [];
        for(var t_name in self.define_objs){
            var d_obj = self.define_objs[t_name];
            self.define_objs[t_name].created = true;
            if(exist_tables[t_name.toUpperCase()]) continue;
            create_indexes = create_indexes.concat( d_obj.table_indexes );
            create_tables.push(d_obj.create_table);
            if(d_obj.create_seq) create_sequences.push(d_obj.create_seq);
        }
        if(create_tables.length){
            var execute_count = 0;
            for(i= 0,l=create_tables.length;i<l;i++){
                con.execute(create_tables[i],{},self.opt,function(e){
                    if(e) _pro.reject({c:con,e:ecode.sql_execute('Create table: '+e.message)});
                    if( (++execute_count) == l ) _pro.resolve({con: con, ins: create_indexes, seqs: create_sequences});
                });
            }
        }else{
            _pro.resolve({con: con, ins: create_indexes, seqs: create_sequences});
        }
        return _pro.promise;
    }).then(function(result){//create index which is not exist
        var _pro = Q.defer();
        var con = result.con,indexes_list = result.ins;
        if(indexes_list.length){
            var execute_count = 0;
            for(var i = 0,l = indexes_list.length; i<l; i++){
                con.execute(indexes_list[i].sql,{},self.opt,function(e){
                    if(e) _pro.reject({c:con,e:ecode.sql_execute('Create index: '+e.message)});
                    if( (++execute_count) == l ) _pro.resolve({con: con, seqs: result.seqs});
                });
            }
        }else{
            _pro.resolve({con: con, seqs: result.seqs});
        }
        return _pro.promise;
    }).then(function(result){//create sequence for tables
        var _pro = Q.defer();
        var con = result.con,sequence_list = result.seqs;
        if(sequence_list.length){
            var execute_count = 0;
            for(var i = 0,l = sequence_list.length; i<l; i++){
                con.execute(sequence_list[i],{},self.opt,function(e){
                    if(e) _pro.reject({c:con,e:ecode.sql_execute('Create sequence: '+e.message)});
                    if( (++execute_count) == l ) _pro.resolve(con);
                });
            }
        }else{
            _pro.resolve(con);
        }
        return _pro.promise;
    }).then(function(con){//release the connection
        con.release();
        _promise.resolve();
    }).catch(function(e){
        if(e.hasOwnProperty('c')) e.c.release();
        _promise.reject(e.e);
    });
    return _promise.promise;
};

Oracle_ORM.prototype.isDefined = function(model_name){
    for(var table_name in this.define_objs){
        if((table_name+'').toUpperCase() == (model_name+'').toUpperCase()) return true;
    }
    return false;
};

Oracle_ORM.prototype.getModel = function(model_name){
    if(this.define_objs.hasOwnProperty(model_name)) return this.define_objs[model_name].model;
    else return null;
};


module.exports = Oracle_ORM;