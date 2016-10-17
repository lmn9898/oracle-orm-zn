Oracle ORM
====

# Contents

1.[Introduction](#intro)

2.[Error Class](#errorclass)
    - 2.1 [Error Properties](#errorproperties)
    
3.[ORM Class](#ormclass)
    - 3.1 [ORM Constants](#ormconstants)
        - 3.1.1 [`Data Type`](#ormdatatype)
    - 3.2 [ORM Properties](#ormproperties)
        - 3.2.1 [`pool`](#ormpool)
        - 3.2.2 [`define_objs`](#ormdefineobjs)
    - 3.3 [ORM Methods](#ormmethods)
        - 3.3.1 [`init()`](#orminit)
        - 3.3.2 [`define()`](#ormdefine)
        - 3.3.3 [`sync()`](#ormsync)
        - 3.3.4 [`isDefined()`](#ormisdefined)
        - 3.3.5 [`getModel()`](#ormgetmodel)
        
4.[Model Class](#modelclass)
    - 4.1 [Model Constants](#modelconstants)
    - 4.2 [Model Properties](#modelproperties)
        - 4.2.1 [`orm`](#modelorm)
        - 4.2.2 [`table_name`](#modeltablename)
        - 4.2.3 [`cor_def`](#modelcordef)
        - 4.2.4 [`sequence`](#modelsequence)
        - 4.2.5 [`primaryKey`](#modelprimarykey)
        - 4.2.6 [`table_indexes`](#modeltableindexes)
    - 4.3 [ORM Methods](#modelmethods)
        - 4.3.1 [`insert()`](#modelinsert)
        - 4.3.2 [`delete()`](#modeldelete)
        - 4.3.3 [`update()`](#modelupdate)
        - 4.3.4 [`findOne()`](#modelfindone)
        - 4.3.5 [`findAll()`](#modelfindall)
        - 4.3.6 [`findAllandCount()`](#modelfindallandcount)
        - 4.3.7 [`upsert()`](#modelupsert)

5.[Appendix](#appendix) 
    - 5.1 [where](#appendixwhere)

# <a name="intro"></a> 1 Introduction

The [oracle-orm-zn](#intro) is built with Oracle's [node-oracledb](https://github.com/oracle/node-oracledb/blob/master/doc/api.md), try to be an ORM for NodeJS using OracleDB.
For how to install oracle-orm-zn, see [INSTALL](https://github.com/oracle/node-oracledb/blob/master/INSTALL.md).

# <a name="errorclass"></a> 2 Error Class

## <a name="errorproperties"></a> 2.1 Error Properties

For now.
 ```
 Integer errorcode
 ```
 - 1001 
 Connection pool to OracleDB is failure.
 
 - 1002 
 No authority for your OracleDB server.
 
 - 1003 
 Cannot get a connection from pool.
 
 - 1004 
 SQL grammar error.
 
 - 3001 
 Parameter not enough.
 
 - 3002 
 Need unique value.
 
 ```
 String errormsg
 ```
 Error detail message.
 
 
# <a name="ormclass"></a> 3 ORM Class

## <a name="ormconstants"></a> 3.1 ORM Constants

### <a name="ormdatatype"></a> 3.1.1 Data Type

 - INTEGER 
    type: `int` , len: `11`.

 - FLOAT 
    type: `float`.

 - STRING 
    type: `string` , len: `255`.

 - DATE 
    type: `date`.
  
## <a name="ormproperties"></a> 3.2 ORM Properties

### <a name="ormdatatype"></a> 3.2.1 pool

 ```
 Pool pool
 ```
 [Class details are in greithub](https://github.com/oracle/node-oracledb/blob/master/doc/api.md#poolclass)

### <a name="ormdefineobjs"></a> 3.2.2 define_objs

 ```
 Object define_objs
 ```
 Object's key is column name, value is defined column options.
 - String primaryKey 
    primary key column name

 - Object sequence 
    sequence column obj
   - column 
    column name
   - seq 
    sequence name

 - String table_name 
    table name

 - Object columns_obj 
    table columns, key is column name, value is `String datatype`.

 - String create_table 
    create table sql

 - String create_seq 
    create sequence sql

 - Array[Object] table_indexes 
    table indexes list
   - String sql 
     The sql to create this index.
   - Array[String] fields 
     The column names of this index.
   - Boolean unique 
     If true if this index is unique.

 - Boolean created 
    flag of table exist

 - Model model 
    table model object

### <a name="ormopt"></a> 3.2.3 opt

 ```
 Object opt
 ```
    ###### Int maxRows
  An affair can return `maxRows` rows results most.
 
## <a name="ormmethods"></a> 3.3 ORM Methods

### <a name="orminit"></a> 3.3.1 init()

##### Prototype

Promise:
 ```
 promise = init(Object options);
 ```

##### Description

This method creates a pool of connections with the specified username, password and connection string.

##### Parameters

 ```
 Object options
 ```

 - String user `require` 
The database user name. Can be a simple user name or a proxy of the form alison[fred]. See the Client Access Through Proxy section in the OCI manual for more details about proxy authentication.

 - String password `require` 
The password of the database user. A password is also necessary if a proxy user is specified.

 - String connectString `require` 
The Oracle database instance to connect to. The string can be an Easy Connect string, or a Net Service Name from a tnsnames.ora file, or the name of a local Oracle database instance. See Connection Strings for examples.

 - Boolean externalAuth 
Indicate whether to connections should be established using External Authentication.
This optional property overrides the Oracledb externalAuth property.
The user and password properties should not be set when externalAuth is true.
Note prior to node-oracledb 0.5 this property was called isExternalAuth.

 - Number stmtCacheSize 
The number of statements to be cached in the statement cache of each connection.
This optional property overrides the Oracledb stmtCacheSize property.

 - String poolAlias 
The poolAlias is an optional property that is used to explicitly add pools to the connection pool cache. If a pool alias is provided, then the new pool will be added to the connection pool cache and the poolAlias value can then be used with methods that utilize the connection pool cache, such as oracledb.getPool() and oracledb.getConnection().
See Connection Pool Cache for details and examples.

 - Number poolMax 
The maximum number of connections to which a connection pool can grow.
This optional property overrides the Oracledb poolMax property.

 - Number poolMin 
The minimum number of connections a connection pool maintains, even when there is no activity to the target database.
This optional property overrides the Oracledb poolMin property.

 - Number poolIncrement 
The number of connections that are opened whenever a connection request exceeds the number of currently open connections.
This optional property overrides the Oracledb poolIncrement property.

 - Number poolTimeout 
The number of seconds after which idle connections (unused in the pool) may be terminated. Idle connections are terminated only when the pool is accessed. If poolTimeout is set to 0, then idle connections are never terminated.
This optional property overrides the Oracledb poolTimeout property.

 - Boolean queueRequests 
Indicate whether pool.getConnection() calls should be queued when all available connections are in currently use.
This optional property overrides the Oracledb queueRequests property.

 - Number queueTimeout 
The number of milliseconds after which connection requests waiting in the connection request queue are terminated. If queueTimeout is set to 0, then queued connection requests are never terminated.

##### Callback

 Success return `null`, error return Error.
 
### <a name="ormdefine"></a> 3.3.2 define()

##### Prototype

Callback:
 ```
 define(String table_name, Object columns, Object options);
 ```

##### Description

This method creates a model of the table with table_name, columns and options.

##### Parameters

 ```
 String table_name
 ```
 The name of which table is created.

 ```
 Object colums
 ```
 This object, key is the column name, value is the option of the column.

 - String type `required` 
When 'option' is String, the column data type is just option.
Otherwise, property 'type' is the data type.
Support types:
 1) NUMBER: 11,
 2) FLOAT,
 3) STRING: 255,
 4) DATE
    PS: You can use the support type string, or use OrmObj.TYPENAME.

 - String name 
If use 'name', table will be created with using this name as the column name.

 - Boolean primaryKey 
The first column which has set 'primaryKey' true will be the primaryKey of the table.

 ```
 Object options
 ```
 Other options for the table.

 - Array indexes 
An array of index option objectes.The option can have these properties:

 - Array field `required` 
An array of string which the column names of index has.

 - String type 
 Index type, include 'normal'/'unique'.

 - String name 
 Index name, which must be unique, default name is 'index_'+tableName+'_'+columnNames.join('_').
 
 - Object/Boolean sequence 
 The Object can have these properties:
  1) String name
   The name of serializable column name, default 'id'.

##### Callback

 Success return Model, error return Error.
 
### <a name="ormsync"></a> 3.3.3 sync()

##### Prototype

Promise:
 ```
 promise = sync();
 ```

##### Description

Check tables which are defined before it. Only create tables when table is not exist. Only create indexes when table is just created.

##### Callback

 Success return `null`, error return Error.
 
### <a name="ormisdefined"></a> 3.3.4 isDefined()

##### Prototype

Callback:
 ```
 isDefined(String table_name);
 ```

##### Description

Return true if the table has defined.

##### Parameters

 ```
 String table_name
 ```
 The name of the model which you are looking for.
 
##### Callback

 Success return Boolean, error return Error.
 
### <a name="ormisdefined"></a> 3.3.5 getModel()

##### Prototype

Callback:
 ```
 getModel(String table_name);
 ```

##### Description

 Return a Model which has named as table_name.

##### Parameters

 ```
 String table_name
 ```
 The name of the model which you are looking for.
 
##### Callback

 Success return Boolean, error return Error.
 


# <a name="modelclass"></a> 4 Model Class

## <a name="modelconstants"></a> 4.1 Model Constants

 None.

## <a name="modelproperties"></a> 4.2 Model Properties

### <a name="modelorm"></a> 4.2.1 orm

 ```
 Object orm
 ```
 It is the `ORM` object which defined this Model object.
 
### <a name="modeltablename"></a> 4.2.2 table_name
 
 ```
 String table_name
 ``` 
 The model's table name.

### <a name="modelcoldef"></a> 4.2.3 col_def
 ```
 Object columns_obj
 ```
 It has table columns, key is column name, value is `String datatype`.
 
### <a name="modelsequence"></a> 4.2.4 sequence
 ```
 Object sequence
 ```
 The sequence column obj

 - column 
 column name

 - seq 
 sequence name
 
### <a name="modelprimarykey"></a> 4.2.5 primaryKey
 ```
 String primaryKey
 ```
 The primary key column name
 
### <a name="modeltableindexes"></a> 4.2.6 table_indexes
 ```
 Array[Object] table_indexes
 ```
 Table indexes list

 - Array[String] fields 
 The column names of this index.

 - Boolean unique 
 If true if this index is unique.

## <a name="modelmethods"></a> 4.3 Model Methods

### <a name="modelinsert"></a> 4.3.1 insert()

##### Prototype

Promise:
 ```
 promise = insert(Array [Object values], Object options);
 ```

##### Description

This method insert a list of rows, has 1 or 2 sql affair.

##### Parameters
 
 ```
 Object values
 ```
 Object's keys are column name, and values are data to be inserted.

 ```
 Object options
 ```
 - Array[String] fields 
 If set, only columns matching those in fields will be inserted.
 
##### Callback
 
 Success ,if table has primaryKey, return `Array` of keys' value; error return Error.

### <a name="modeldelete"></a> 4.3.2 delete()

##### Prototype

Promise:
 ```
 promise = delete(Object options);
 ```

##### Description

This method delete rows, has 1 affair.

##### Parameters
 
 ```
 Object options
 ```

 - Object where `required` 
 Set filter for this method, details of `where` in [Appendix where](#appendixwhere)
 
##### Callback
 
 Success, return number of affected rows; error return Error.
  
### <a name="modelupdate"></a> 4.3.3 update()

##### Prototype

Promise:
 ```
 promise = update( Object value, Object options );
 ```

##### Description

This method udate rows which are match the `where` options, has 1 affair.

##### Parameters

 ```
 Object value
 ```
 Object's keys are column name, and values are data to be updated.
 
 ```
 Object options
 ```

 - Object where `required` 
 Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

 - Array[String] fields 
 If set, only columns matching those in fields will be updated.
 
##### Callback
 
 Success, return number of affected rows; error return Error.
  
### <a name="modelfindone"></a> 4.3.4 findOne()

##### Prototype

Promise:
 ```
 promise = findOne( Object options );
 ```

##### Description

This method select one row which is match the `where` options, has 1 affair.

##### Parameters
 
 ```
 Object options
 ```
 - Object where 
 Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

 - Array[String] attributes 
 If set, only columns matching those in fields will be selected.

 - Array[Object] include 
 If set, relate other tables. Object as follows.
    - Model model `required` 
    The table Model object, which is going to be related.
    - String use `required` 
    The key column of the parent table.
    - String on `required` 
    The key column of the related table.
    - Object where
    The object of `where` to filter rows of related table.
    - Array[String] attributes 
    If set, only columns matching those in fields will be selected.
    - Boolean notRequired 
    If true, parent table will `left join` related table.
    - Array[Object] include 
    If set, relate other tables.
 
##### Callback
 
 Success, return `Object` of the selected row, or `null` if selected none; error return Error.
 
### <a name="modelfindall"></a> 4.3.5 findAll()

##### Prototype

Promise:
 ```
 promise = findAll( Object options );
 ```

##### Description

This method select rows which are match the `where` options, has 1 affair.

##### Parameters
 
 ```
 Object options
 ```
 - Object where 
 Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

 - Array[String] fields 
 If set, only columns matching those in fields will be selected.

 - Array[String]/String order 
 If set, selected rows while order by them/it, `String` like ' id desc '.

 - Integer limit 
 If set, only return first `limit` rows.

 - Integer offset 
 If set, return rows from the `offset` row.
 
 - Array[Object] include 
 If set, relate other tables. Object as follows.
    - Model model `required` 
    The table Model object, which is going to be related.
    - String use `required` 
    The key column of the parent table.
    - String on `required` 
    The key column of the related table.
    - Object where
    The object of `where` to filter rows of related table.
    - Array[String] attributes 
    If set, only columns matching those in fields will be selected.
    - Boolean notRequired 
    If true, parent table will `left join` related table.
    - Array[Object] include 
    If set, relate other tables.
 
##### Callback
 
 Success, return `Array[Object]` of the selected rows, or `null` if selected none; error return Error.

### <a name="modelfindallandcount"></a> 4.3.6 findAllandCount()

##### Prototype

Promise:
 ```
 promise = findAllandCount( Object options );
 ```

##### Description

This method select rows which are match the `where` options, has 1 affair.

##### Parameters
 
 ```
 Object options
 ```
 - Object where 
 Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

 - Array[String] fields 
 If set, only columns matching those in fields will be selected.

 - Array[String]/String order 
 If set, selected rows while order by them/it, `String` like ' id desc '.

 - Integer limit 
 If set, only return first `limit` rows.

 - Integer offset 
 If set, return rows from the `offset` row.
 
 - Array[Object] include 
 If set, relate other tables. Object as follows.
    - Model model `required` 
    The table Model object, which is going to be related.
    - String use `required` 
    The key column of the parent table.
    - String on `required` 
    The key column of the related table.
    - Object where
    The object of `where` to filter rows of related table.
    - Array[String] attributes 
    If set, only columns matching those in fields will be selected.
    - Boolean notRequired 
    If true, parent table will `left join` related table.
    - Array[Object] include 
    If set, relate other tables.
 
##### Callback
 
 Success, return `Object` : the `rows` are the selected rows , or `null` if selected none; the `all` is the count of all rows.
 Error, return Error.
 ```
 {
    all: [Integer],
    rows: [ Array[Object] ]
 }
 ```

### <a name="modelupsert"></a> 4.3.7 upsert()

##### Prototype

Promise:
 ```
 promise = upsert( Object value [, Object options] );
 ```

##### Description

This method will execute `UPDATE` if `value` has unique column which can found in the table, otherwise `INSERT`. _unique column_, like primary key or unique index, is `required`.
When execute `UPDATE`, this method has 2 affair.
When execute `INSERT`, this method has 2 affair or 3 affair if table has sequence primary key.


##### Parameters

 ```
 Object value
 ```
 Object's keys are column name, and values are data to be upserted.
 
 ```
 Object options
 ```
 - Array[String] fields 
 If set, only columns matching those in fields will be upserted.
 
##### Callback
 
 - Success 
 return `Object` which has two parameters; 
 ```
 Integer flag
 ```
 It meens the method did `INSERT` if 0 and `UPDATE` if 1.

 ```
 Integer/Array result
 ```
 It is `Array` if the method did `INSERT`, and is `Integer` if did `UPDATE`.
 
 - Error 
 return Error.
 
 
 

# <a name="appendix"></a> Appendix
 
## <a name="appendixwhere"></a>  where
 
### _i._   operator 

  `$gt`  : `>` 
  
  `$gte` : `>=` 
  
  `$lt`  : `<` 
  
  `$lte` : `<=` 
  
  `$ne`  : `!=` 
  
   ```
    where : {
        id : {
           $gt : value1,
           $lt : value2
        }
    }
   ```
   
### _ii._  range 

  `$in`  :  `key in (value1, value2, value3)` 
   ```
   where : {
       id : {
          $in : [ value1,value2,value3 ]
       }
   }
  ```
  
  `$notin`  :  `key not in (value1, value2, value3)`
   ```
   where : {
       id : {
          $notin : [ value1,value2,value3 ]
       }
   }
  ```
  
  `$between`  :  `key between value1 and value2`
   ```
   where : {
       id : {
          $between : [ value1,value2 ]
       }
   }
  ```
  
  `$notbetween`  :  `key not between value1 and value2`
   ```
   where : {
       id : {
          $notbetween : [ value1,value2 ]
       }
   }
  ```

### _iii._ like 

  `$like` :  `key like '%value%'`
   ```
   where : {
       name : {
          $like : value
       }
   }
   ```
   
### _iv._  logic 

  `ORM.and([ logic1 , logic2 ])` :  `( logic1 and logic2 )`
  
  `ORM.or([ logic1 , logic2 , logic3 ])` :  `( logic1 or logic2 or logic3 )`
   ```
   where : ORM.and([
       logic1,
       ORM.or([
           logic2,
           logic3
       ])
   ])
   ```
   TS: ( logic11 and ( logic22 or logic33 ))
   
   PS: 
   - logic1 like `id : { $gt: 12}`; 
   - logic11 like `id > 12` .
