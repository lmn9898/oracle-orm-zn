/**
 * Created by lmn on 10/8/16.
 */
var ecode = require('./error_code.js');
var extend = require('extend');
var dateformat = require('date-format');
var Q = require("q");
var lib = require('./tools');

function Model(table_name,orm){
    var def_obj = orm.define_objs[table_name];
    this.orm = orm;
    this.table_name = table_name;
    this.col_def = def_obj.columns_obj;// {columnName: orm.INTEGER}
    this.sequence = def_obj.sequence;//{column: seq_column_name, seq: 'SEQ_'+table_name.toUpperCase()};
    this.primaryKey = def_obj.primaryKey;// columnName
    this.table_name = table_name;
    this.table_indexes = [];
    for (var i= 0,l= def_obj.table_indexes.length;i<l;i++){
        this.table_indexes.push({
            fields: def_obj.table_indexes[i].fields,
            unique: def_obj.table_indexes[i].unique
        });
    }
}

Model.prototype.insert = function(value_list, options){
    var pro = Q.defer(), self = this;
    var sql = 'begin ';
    var filter = {};// columnName: orm.INTEGER;
    var keyList = [];
    if(!value_list.length){
        value_list = [value_list];
    }
    if(options && options.fields){
        for(var ind= 0,ln=options.fields.length;ind<ln;ind++){
            var _column_name = options.fields[ind];
            if(self.col_def.hasOwnProperty(_column_name)) filter[_column_name] = self.col_def[_column_name];
        }
    }else filter = self.col_def;

    for(var i= 0,list_length=value_list.length;i<list_length;i++){
        var kvs = value_list[i];
        var columns = '(',values = '(';
        for(var key in kvs){
            if(filter.hasOwnProperty(key)) {
                if (self.sequence && self.sequence.column == key) continue;
                columns += key + ',';
                var value = null;
                if (filter[key] == self.orm.INTEGER) {
                    value = (isNaN(kvs[key]) ? 0 : parseInt(kvs[key]));
                    if (key == self.primaryKey) keyList.push(value);
                } else if (filter[key] == self.orm.FLOAT) {
                    value = (isNaN(kvs[key]) ? 0 : parseFloat(kvs[key]));
                    if (key == self.primaryKey) keyList.push(value);
                } else if (filter[key] == self.orm.STRING) {
                    value = "'" + kvs[key] + "'";
                    if (key == self.primaryKey) keyList.push(kvs[key]+'');
                } else if (filter[key] == self.orm.DATE) {
                    value = "to_date('" + dateformat('yyyy-MM-dd hh:mm:ss', new Date(kvs[key])) + "','yyyy-mm-dd hh24:mi:ss')";
                    if (key == self.primaryKey) keyList.push(kvs[key]);
                }
                values += value + ',';
            }
        }
        if(self.sequence) {
            columns += self.sequence.column+',';
            values += self.sequence.seq+'.nextval,';
        }
        columns = columns.substring(0,columns.length-1)+')';
        values = values.substring(0,values.length-1)+')';
        sql += ' insert into '+self.table_name+columns+' values '+values+';';
    }
    sql += ' end;';

    self.orm.getCon().then(function(con){//find currval of sequence key
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e){
            if(e) _pro.reject({c:con,e:'Insert error: '+ e.message});
            else {
                con.commit(function(e){
                    if(e) _pro.reject({c:con,e:'Insert commit error: '+ e.message});
                    _pro.resolve(con);
                });
            }
        });
        return _pro.promise;
    }).then(function(con){
        var _pro = Q.defer();
        if(self.sequence){
            con.execute('select '+self.sequence.seq+'.currval from dual',{},self.orm.opt,function(e,r){
                if(e) _pro.reject({c:con,e:'Select sequence currval error: '+ e.message});
                else {
                    var start = r.rows[0].CURRVAL;
                    for(var j=0;j<list_length;j++){
                        keyList.unshift(start-j);
                    }
                    _pro.resolve({c: con, r: keyList});
                }
            });
        }else{
            _pro.resolve({c: con, r: keyList});
        }
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.delete = function(options){
    var pro = Q.defer(), self = this;
    if(!options || !options.where){
        pro.reject(ecode.lack_para());
        return pro.promise;
    }
    var sql = 'delete from '+ self.table_name+' where '+lib.whereObjToSqlStr(options.where, self.col_def);
    self.orm.getCon().then(function(con){
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'Delete error: '+ e.message});
            else {
                con.commit(function(e){
                    if(e) _pro.reject({c:con,e:'Delete commit error: '+ e.message});
                    _pro.resolve({c:con,r: r.rowsAffected});
                });
            }
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.update = function(value, options){
    var pro = Q.defer(), self = this;
    var sql = 'update '+self.table_name+' set ';
    var filter = {};// {columnName: orm.INTEGER}
    if(!options || !options.where || !value){
        pro.reject(ecode.lack_para());
        return pro.promise;
    }
    if(options.fields){
        for(var ind= 0,ln=options.fields.length;ind<ln;ind++){
            var _column_name = options.fields[ind];
            if(self.col_def.hasOwnProperty(_column_name))
                filter[_column_name] = self.col_def[_column_name];
        }
    }else{
        filter = self.col_def;
    }
    for(var key in value){
        if(filter.hasOwnProperty(key)) {
            if (self.sequence && self.sequence.column == key) continue;
            sql += key+'='+lib.valueToSqlStr(filter[key],value[key])+',';
        }
    }
    sql =  sql.substring(0,sql.length-1) + ' where ' + lib.whereObjToSqlStr(options.where,self.col_def);
    self.orm.getCon().then(function(con){//find currval of sequence key
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'UpdateOne error: '+ e.message});
            else {
                con.commit(function(e){
                    if(e) _pro.reject({c:con,e:'UpdateOne commit error: '+ e.message});
                    _pro.resolve({c:con,r: r.rowsAffected});
                });
            }
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.upsert = function(value, options){
    var pro = Q.defer(), self = this;
    var filter = {};// {columnName: orm.INTEGER}
    if(options && options.fields){
        for(var ind= 0,ln=options.fields.length;ind<ln;ind++){
            var _column_name = options.fields[ind];
            if(self.col_def.hasOwnProperty(_column_name))
                filter[_column_name] = self.col_def[_column_name];
        }
    }else{
        filter = self.col_def;
    }
    var _count_where = '';
    if(self.primaryKey && value.hasOwnProperty(self.primaryKey)){
        _count_where = self.primaryKey+'='+lib.valueToSqlStr(self.col_def[self.primaryKey],value[self.primaryKey])+' ';
    }else if(self.table_indexes.length){
        for(var i= 0,l=self.table_indexes.length;i<l;i++){
            var _index = self.table_indexes[i];
            if(_index.unique){
                var fields = _index.fields;
                for(var j= 0 ; j<fields.length; j++){
                    if(value.hasOwnProperty(fields[j])){
                        _count_where += fields[0]+'='+lib.valueToSqlStr(self.col_def[fields[j]],value[fields[j]])+' and ';
                    }
                }
                if(_count_where.length) _count_where = _count_where.substring(0,_count_where.length-4);
                break;
            }
        }
    }
    if(_count_where == ''){
        pro.reject(ecode.lack_unique());
        return pro.promise;
    }
    self.orm.getCon().then(function(con){
        var _pro = Q.defer();
        var sql = 'select count(*) as count from '+self.table_name+' where '+_count_where;
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'Upsert select error:'+ e.message});
            else{
                var count = r.rows[0].COUNT;
                if(count > 1) _pro.reject({c:con,e:'Upsert select more the 1 row.'});
                else _pro.resolve({c:con,r:count});
            }
        });
        return _pro.promise;
    }).then(function(res){
        var _pro = Q.defer();
        var con = res.c, flag = res.r, sql = '', keyList = [];
        if(flag){
            sql = 'update '+self.table_name+' set ';
            for(var key in value){
                if(filter.hasOwnProperty(key)) {
                    if (self.sequence && self.sequence.column == key) continue;
                    sql += key+'='+lib.valueToSqlStr(filter[key],value[key])+',';
                }
            }
            sql =  sql.substring(0,sql.length-1) + ' where ' + _count_where;
        }else{
            var columns = '(',values = '(';
            for(var key in value){
                if(filter.hasOwnProperty(key)) {
                    if (self.sequence && self.sequence.column == key) continue;
                    columns += key + ',';
                    var _value = null;
                    if (filter[key] == self.orm.INTEGER) {
                        _value = (isNaN(value[key]) ? 0 : parseInt(value[key]));
                        if (key == self.primaryKey) keyList.push(_value);
                    } else if (filter[key] == self.orm.FLOAT) {
                        _value = (isNaN(value[key]) ? 0 : parseFloat(value[key]));
                        if (key == self.primaryKey) keyList.push(_value);
                    } else if (filter[key] == self.orm.STRING) {
                        _value = "'" + value[key] + "'";
                        if (key == self.primaryKey) keyList.push(value[key]+'');
                    } else if (filter[key] == self.orm.DATE) {
                        _value = "to_date('" + dateformat('yyyy-MM-dd hh:mm:ss', new Date(value[key])) + "','yyyy-mm-dd hh24:mi:ss')";
                        if (key == self.primaryKey) keyList.push(value[key]);
                    }
                    values += _value + ',';
                }
            }
            if(self.sequence) {
                columns += self.sequence.column+',';
                values += self.sequence.seq+'.nextval,';
            }
            columns = columns.substring(0,columns.length-1)+')';
            values = values.substring(0,values.length-1)+')';
            sql = 'insert into '+self.table_name+columns+' values '+values;
        }
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'Upsert error:'+ e.message});
            else{
                con.commit(function(e){
                    if(e) _pro.reject({c:con,e:'Upsert commit error: '+ e.message});
                    if(flag) _pro.resolve({c:con,r: r.rowsAffected,f:flag});
                    else _pro.resolve({c:con,r: keyList,f:flag});
                });
            }
        });
        return _pro.promise;
    }).then(function(res){
        var _pro = Q.defer(), keyList = [];
        var con = res.c;
        if(res.f){
            _pro.resolve({c:con, r: {flag: res.f, result: res.r} });
        }else{
            if(self.sequence){
                con.execute('select '+self.sequence.seq+'.currval from dual',{},self.orm.opt,function(e,r){
                    if(e) _pro.reject({c:con,e:'Select sequence currval error: '+ e.message});
                    else {
                        keyList.unshift(r.rows[0].CURRVAL);
                        _pro.resolve({c: con, r: {flag: res.f, result: keyList}});
                    }
                });
            }else{
                _pro.resolve({c: con, r: {flag: res.f, result: res.r} });
            }
        }
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.findOne = function(options){
    var pro = Q.defer(), self = this;
    var sql = '';
    if(!options){
        sql += 'select * from '+self.table_name + ' where rownum=1 ';
    }else{
        var _col = '', _tab = '', _where = '';
        var makeCTW = function(opt, par_tn){
            if(!opt.model ) { pro.reject(ecode.lack_para());return pro.promise;}
            var sub_tn = opt.model.table_name;
            //make column sql (has ',' last)
            if(opt.attributes && opt.attributes.length){
                for(var i=0;i<opt.attributes.length;i++){
                    _col += par_tn? sub_tn+'.'+opt.attributes[i]+' as '+sub_tn+'#'+opt.attributes[i]+',' : sub_tn+'.'+opt.attributes[i]+',';
                }
            }else{
                if(par_tn){
                    for(var colkey in opt.model.col_def){
                        _col += sub_tn+'.'+colkey+' as '+sub_tn+'#'+colkey+',';
                    }
                }else
                    _col += sub_tn+'.*,';
            }
            //make table sql (has ',' front)
            if(opt.notRequired && par_tn){
                if(!opt.use||!opt.on){ pro.reject(ecode.lack_para());return pro.promise;}
                _tab += ' left join '+sub_tn+' on '+par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on;
            }else{
                _tab += ','+sub_tn;
            }
            //make where sql (has ' and ' last)
            if(opt.where){
                _where += lib.whereObjToSqlStr(opt.where,opt.model.col_def,sub_tn)+' and ';
            }
            if(!opt.notRequired && par_tn){
                if(!opt.use||!opt.on){
                    pro.reject(ecode.lack_para());return pro.promise;
                }
                _where += par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on+' and ';
            }
            if(opt.include && opt.include.length){
                for(var j= 0; j<opt.include.length; j++) makeCTW(opt.include[j],sub_tn);
            }
        };
        options.model = self;
        makeCTW(options);
        sql += 'select '+_col.substring(0,_col.length-1)+' from '+_tab.substring(1,_tab.length)+
            (_where==''?'':(' where '+_where.substring(0,_where.length-4)));
    }
    self.orm.getCon().then(function(con){//find currval of sequence key
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'FindOne error: '+ e.message});
            else {
                _pro.resolve({c:con,r: r.rows.length? r.rows[0]: null});
            }
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        for(var k in res.r){
            var ks = k.split('#');
            if(ks.length ==2 && ks[0] && ks[1]){
                if(!res.r[ks[0]]) res.r[ks[0]] = {};
                res.r[ks[0]][ks[1]] = res.r[k];
                delete res.r[k];
            }
        }
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.findAll = function(options){
    var pro = Q.defer(), self = this;
    var sql = 'select * from (select rownum rownum_,t.* from ', start = 0, end = 100;
    if(!options){
        sql += self.table_name+ ' t where rownum <= ' + end + ')' ;
    }else{
        sql += '(';
        var _col = '', _tab = '', _where = '';
        var makeCTW = function(opt, par_tn){
            if(!opt.model ) { pro.reject(ecode.lack_para());return pro.promise;}
            var sub_tn = opt.model.table_name;
            //make column sql (has ',' last)
            if(opt.attributes && opt.attributes.length){
                for(var i=0;i<opt.attributes.length;i++){
                    _col += par_tn? sub_tn+'.'+opt.attributes[i]+' as '+sub_tn+'#'+opt.attributes[i]+',' : sub_tn+'.'+opt.attributes[i]+',';
                }
            }else{
                if(par_tn){
                    for(var colkey in opt.model.col_def){
                        _col += sub_tn+'.'+colkey+' as '+sub_tn+'#'+colkey+',';
                    }
                }else
                    _col += sub_tn+'.*,';
            }
            //make table sql (has ',' front)
            if(opt.notRequired && par_tn){
                if(!opt.use||!opt.on){ pro.reject(ecode.lack_para());return pro.promise;}
                _tab += ' left join '+sub_tn+' on '+par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on;
            }else{
                _tab += ','+sub_tn;
            }
            //make where sql (has ' and ' last)
            if(opt.where){
                _where += lib.whereObjToSqlStr(opt.where,opt.model.col_def,sub_tn)+' and ';
            }
            if(!opt.notRequired && par_tn){
                if(!opt.use||!opt.on){
                    pro.reject(ecode.lack_para());return pro.promise;
                }
                _where += par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on+' and ';
            }
            if(opt.include && opt.include.length){
                for(var j= 0; j<opt.include.length; j++) makeCTW(opt.include[j],sub_tn);
            }
        };
        options.model = self;
        makeCTW(options);
        sql += 'select '+_col.substring(0,_col.length-1)+' from '+_tab.substring(1,_tab.length)+
            (_where==''?'':(' where '+_where.substring(0,_where.length-4)))+
            ') t where rownum<='+end+' ) where rownum_>='+start;
        if(options.order){
            if(typeof(options.order) == 'string') sql += ' order by '+options.order;
            else if(options.order.length){
                sql += ' order by ';
                for(var i= 0,l= options.order.length;i<l;i++) sql += options.order[i]+',';
                sql = sql.substring(0,sql.length-1);
            }
        }
    }
    self.orm.getCon().then(function(con){//find currval of sequence key
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'FindAll error: '+ e.message});
            else _pro.resolve({c:con,r: r.rows.length? r.rows: null});
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        if(res.r && res.r.length){
            for(var i= 0,l=res.r.length;i<l;i++){
                delete res.r[i].ROWNUM_;
                for(var k in res.r[i]){
                    var ks = k.split('#');
                    if(ks.length ==2 && ks[0] && ks[1]){
                        if(!res.r[i][ks[0]]) res.r[i][ks[0]] = {};
                        res.r[i][ks[0]][ks[1]] = res.r[i][k];
                        delete res.r[i][k];
                    }
                }
            }
        }
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.findAllandCount = function(options){
    var pro = Q.defer(), self = this;
    var sql_count = 'select count(*) as count from ' + self.table_name;
    var sql = 'select * from (select rownum rownum_,t.* from ', start = 0, end = 100;
    if(!options){
        sql += self.table_name+ ' where rownum <= ' + end ;
    }else{
        sql += '(';
        var _col = '', _tab = '', _where = '';
        var makeCTW = function(opt, par_tn){
            if(!opt.model ) { pro.reject(ecode.lack_para());return pro.promise;}
            var sub_tn = opt.model.table_name;
            //make column sql (has ',' last)
            if(opt.attributes && opt.attributes.length){
                for(var i=0;i<opt.attributes.length;i++){
                    _col += par_tn? sub_tn+'.'+opt.attributes[i]+' as '+sub_tn+'#'+opt.attributes[i]+',' : sub_tn+'.'+opt.attributes[i]+',';
                }
            }else{
                if(par_tn){
                    for(var colkey in opt.model.col_def){
                        _col += sub_tn+'.'+colkey+' as '+sub_tn+'#'+colkey+',';
                    }
                }else
                    _col += sub_tn+'.*,';
            }
            //make table sql (has ',' front)
            if(opt.notRequired && par_tn){
                if(!opt.use||!opt.on){ pro.reject(ecode.lack_para());return pro.promise;}
                _tab += ' left join '+sub_tn+' on '+par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on;
            }else{
                _tab += ','+sub_tn;
            }
            //make where sql (has ' and ' last)
            if(opt.where){
                _where += lib.whereObjToSqlStr(opt.where,opt.model.col_def,sub_tn)+' and ';
            }
            if(!opt.notRequired && par_tn){
                if(!opt.use||!opt.on){
                    pro.reject(ecode.lack_para());return pro.promise;
                }
                _where += par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on+' and ';
            }
            if(opt.include && opt.include.length){
                for(var j= 0; j<opt.include.length; j++) makeCTW(opt.include[j],sub_tn);
            }
        };
        options.model = self;
        makeCTW(options);
        sql += 'select '+_col.substring(0,_col.length-1)+' from '+_tab.substring(1,_tab.length)+
            (_where==''?'':(' where '+_where.substring(0,_where.length-4)))+
            ') t where rownum<='+end+' ) where rownum_>='+start;
        if(options.order){
            if(typeof(options.order) == 'string') sql += ' order by '+options.order;
            else if(options.order.length){
                sql += ' order by ';
                for(var i= 0,l= options.order.length;i<l;i++) sql += options.order[i]+',';
                sql = sql.substring(0,sql.length-1);
            }
        }
    }
    self.orm.getCon().then(function(con){
        var _pro = Q.defer();
        con.execute(sql_count,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'FindAllandCount count error: '+ e.message});
            else _pro.resolve({c:con,r: r.rows[0].COUNT});
        });
        return _pro.promise;
    }).then(function(res){
        var con = res.c, count = res.r;
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'FindAllandCount select error: '+ e.message});
            else _pro.resolve({c:con,r: r.rows.length? r.rows: null, count: count});
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        if(res.r && res.r.length){
            for(var i= 0,l=res.r.length;i<l;i++){
                delete res.r[i].ROWNUM_;
                for(var k in res.r[i]){
                    var ks = k.split('#');
                    if(ks.length ==2 && ks[0] && ks[1]){
                        if(!res.r[i][ks[0]]) res.r[i][ks[0]] = {};
                        res.r[i][ks[0]][ks[1]] = res.r[i][k];
                        delete res.r[i][k];
                    }
                }
            }
        }
        pro.resolve({
            all: res.count,
            rows: res.r
        });
    }).catch(function(e){
        e.c.release();
        pro.reject(ecode.sql_execute(e.e));
    });
    return pro.promise;
};

Model.prototype.findorInsert = function(value_list, options){
    var pro = Q.defer(), self = this;
    self.count(options).then(function(count){
        var _pro = Q.defer();
        if(count){
            self.findAll(options).then(function(found){
                _pro.resolve({flag: 1, result: found });
            }).catch(function(e){_pro.reject(e);})
        }else{
            self.insert(value_list, options).then(function(keys){
                _pro.resolve({flag: 0, result: keys});
            }).catch(function(e){_pro.reject(e);})
        }
        return _pro.promise;
    }).then(function(res){
        pro.resolve(res);
    }).catch(function(e){
        pro.reject(e);
    });
    return pro.promise;
};

Model.prototype.count = function(options){
    var pro = Q.defer(), self = this;
    var _tab = '', _where = '';
    var makeCTW = function(opt, par_tn){
        if(!opt.model ) { pro.reject(ecode.lack_para());return pro.promise;}
        var sub_tn = opt.model.table_name;
        //make table sql (has ',' front)
        if(opt.notRequired && par_tn){
            if(!opt.use||!opt.on){ pro.reject(ecode.lack_para());return pro.promise;}
            _tab += ' left join '+sub_tn+' on '+par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on;
        }else{
            _tab += ','+sub_tn;
        }
        //make where sql (has ' and ' last)
        if(opt.where){
            _where += lib.whereObjToSqlStr(opt.where,opt.model.col_def,sub_tn)+' and ';
        }
        if(!opt.notRequired && par_tn){
            if(!opt.use||!opt.on){
                pro.reject(ecode.lack_para());return pro.promise;
            }
            _where += par_tn+'.'+opt.use+'='+sub_tn+'.'+opt.on+' and ';
        }
        if(opt.include && opt.include.length){
            for(var j= 0; j<opt.include.length; j++) makeCTW(opt.include[j],sub_tn);
        }
    };
    options.model = self;
    makeCTW(options);
    var sql = 'select count(*) as count from '+_tab.substring(1,_tab.length)+(_where==''?'':(' where '+_where.substring(0,_where.length-4)));
    self.orm.getCon().then(function(con){
        var _pro = Q.defer();
        con.execute(sql,{},self.orm.opt,function(e,r){
            if(e) _pro.reject({c:con,e:'Count error: '+ e.message});
            else _pro.resolve({c:con,r: r.rows[0].COUNT});
        });
        return _pro.promise;
    }).then(function(res){
        res.c.release();
        pro.resolve(res.r);
    }).catch(function(e){
        e.c.release();
        pro.reject(e.e);
    });
    return pro.promise;
};

module.exports = Model;