Oracle ORM  _V1.2.2_
====================

##### Update content
######Edit:
ORM Class
    - [define()](#ormdefine)
   
   Add `length` parameter for column.
    
######Add:
  Model Class
    - [`drop()`](#modeldrop)
    
# Contents

1. [Introduction](#intro)

2. [Error Class](#errorclass)
    - 2.1 [Error Properties](#errorproperties)
    
3. [ORM Class](#ormclass)
    - 3.1 [ORM Constants](#ormconstants)
        - 3.1.1 [`Data Type`](#ormdatatype)
    - 3.2 [ORM Properties](#ormproperties)
        - 3.2.1 [`pool`](#ormpool)
        - 3.2.2 [`define_objs`](#ormdefineobjs)
        - 3.2.3 [`opt`](#ormopt)
    - 3.3 [ORM Methods](#ormmethods)
        - 3.3.1 [`init()`](#orminit)
        - 3.3.2 [`define()`](#ormdefine)
        - 3.3.3 [`sync()`](#ormsync)
        - 3.3.4 [`isDefined()`](#ormisdefined)
        - 3.3.5 [`getModel()`](#ormgetmodel)
        - 3.3.5 [`execute()`](#ormexecute)
        
4. [Model Class](#modelclass)
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
        - 4.3.8 [`findorInsert()`](#modelfindorinsert)
        - 4.3.9 [`count()`](#modelcount)
        - 4.3.10 [`max()`](#modelmax)
        - 4.3.11 [`min()`](#modelmin)
        - 4.3.12 [`sum()`](#modelsum)
        - 4.3.13 [`drop()`](#modeldrop)
        
5. [Appendix](#appendix) 
    - 5.1 [where](#appendixwhere)

# <a name="intro"></a> 1 Introduction

The [oracle-orm-zn](#intro) is built with Oracle's [node-oracledb](https://github.com/oracle/node-oracledb/blob/master/doc/api.md), try to be an ORM for NodeJS using OracleDB.
For how to install oracle-orm-zn, please go to [INSTALL](https://github.com/oracle/node-oracledb/blob/master/INSTALL.md).

##### For example, install oracle client in Linux:

1. Download these three RPM from [Oracle](http://www.oracle.com/technetwork/database/features/instant-client/index-097480.html);
    1) oracle-instantclient*.*-basic-*.rpm
    2) oracle-instantclient*.*-sqlplus-*.rpm
    3) oracle-instantclient*.*-devel-*.rpm
2. Install alien;
    ~~~
    sudo apt-get install alien
    ~~~
3. Install Oracle client;
    ~~~
    sudo alien -i oracle-instantclient*.*-basic*.rpm
    sudo alien -i oracle-instantclient*.*-sqlplus*.rpm
    sudo alien -i oracle-instantclient*.*-devel*.rpm
    ~~~
4. Install libaio.so.1.
    ~~~
    sudo apt-get install libaio1
    ~~~

# <a name="errorclass"></a> 2 Error Class
For now, there are only these errors can be returned.

## <a name="errorproperties"></a> 2.1 Error Properties
```
Integer errorcode
```
- 1001: Connection pool to OracleDB is failure.
- 1002: No authority for your OracleDB server.
- 1003: Cannot get a connection from pool.
- 1004: SQL grammar error.
- 3001: Parameter not enough.
- 3002: Need unique value.
- 3003: Parameters have problems.
```
String errormsg
```
Error detail message.

# <a name="ormclass"></a> 3 ORM Class

## <a name="ormconstants"></a> 3.1 ORM Constants

### <a name="ormdatatype"></a> 3.1.1 Data Type
- INTEGER 

  type: `int` , default length: `11`.
  
- FLOAT 
 
  type: `float`.

- STRING 
 
  type: `string` , default length: `255`.

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

- String `primaryKey` 
 
  Primary key column name.

- Object `sequence` 
 
  Sequence column obj.
 
    - sequence.`column`
   
    Column name.
   
    - sequence.`seq`
   
    Sequence name.

- String `table_name`
 
  Table name.

- Object `columns_obj` 
 
  Table columns, key is column name, value is `String datatype`.

- String `create_table` 
 
  Create table sql.

- String `create_seq` 
 
  Create sequence sql.

- Array[Object] `table_indexes` 
 
  Table indexes list.
 
   - String `sql` 
   
     The sql to create this index.
   
   - Array[String] `fields` 
   
     The column names of this index.
   
   - Boolean `unique` 
   
     If true if this index is unique.

- Boolean `created` 
 
  flag of table exist

- Model `model` 
 
  table model object

### <a name="ormopt"></a> 3.2.3 opt
```
Object opt
```
 This is an optional parameter that may be used to control statement execution.

##### 3.2.3.1 autoCommit
```
Boolean autoCommit
```
If this property is true, then the transaction in the current connection is automatically committed at the end of statement execution.
  
The default value is false.
  
##### 3.2.3.2 extendedMetaData
```
Boolean extendedMetaData
```
Determines whether additional metadata is available for queries and for REF CURSORs returned from PL/SQL blocks.
  
The default value for extendedMetaData is false. With this value, the result.metaData result.resultSet.metaData objects only include column names.
  
If extendedMetaData is true then metaData will contain additional attributes. These are listed in [Result Object Properties](#ormexecuteresult).

##### 3.2.3.3 maxRows
```
Integer maxRows
```
Rows beyond this limit are not fetched from the database.
  
The default value is 100.

##### 3.2.3.4 prefetchRows
```
Integer prefetchRows
```
The number of additional rows the underlying Oracle client library fetches whenever node-oracledb requests query data from the database.
  
Prefetching is a tuning option to maximize data transfer efficiency and minimize round-trips to the database. The prefetch size does not affect when, or how many, rows are returned by node-oracledb to the application. The cache management is transparently handled by the Oracle client libraries.
  
The default value is 100.
 
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
- String `user` [require]

  The database user name. Can be a simple user name or a proxy of the form alison[fred]. See the Client Access Through Proxy section in the OCI manual for more details about proxy authentication.

- String `password` [require]
 
  The password of the database user. A password is also necessary if a proxy user is specified.

- String `connectString` [require]
 
  The Oracle database instance to connect to. The string can be an Easy Connect string, or a Net Service Name from a tnsnames.ora file, or the name of a local Oracle database instance. See Connection Strings for examples.

- Boolean `externalAuth`
 
  Indicate whether to connections should be established using External Authentication. This optional property overrides the Oracledb externalAuth property. The user and password properties should not be set when externalAuth is true. Note prior to node-oracledb 0.5 this property was called isExternalAuth.

- Number `stmtCacheSize`
 
  The number of statements to be cached in the statement cache of each connection. This optional property overrides the Oracledb stmtCacheSize property.

- String `poolAlias`
 
  The poolAlias is an optional property that is used to explicitly add pools to the connection pool cache. If a pool alias is provided, then the new pool will be added to the connection pool cache and the poolAlias value can then be used with methods that utilize the connection pool cache, such as oracledb.getPool() and oracledb.getConnection(). See Connection Pool Cache for details and examples.

- Number `poolMax`
 
  The maximum number of connections to which a connection pool can grow. This optional property overrides the Oracledb poolMax property.

- Number `poolMin`

  The minimum number of connections a connection pool maintains, even when there is no activity to the target database. This optional property overrides the Oracledb poolMin property.

- Number `poolIncrement`
 
  The number of connections that are opened whenever a connection request exceeds the number of currently open connections. This optional property overrides the Oracledb poolIncrement property.

- Number `poolTimeout`

  The number of seconds after which idle connections (unused in the pool) may be terminated. Idle connections are terminated only when the pool is accessed. If poolTimeout is set to 0, then idle connections are never terminated. This optional property overrides the Oracledb poolTimeout property.

- Boolean `queueRequests`
 
  Indicate whether pool.getConnection() calls should be queued when all available connections are in currently use. This optional property overrides the Oracledb queueRequests property.

- Number `queueTimeout`

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

The option can be the type of the column, like `ORM.INTEGER`, or be a Object which have these:

- String `type` [required]

  When 'option' is String, the column data type is just option. Otherwise, property 'type' is the data type.
 
  Support types:
  1) ORM.NUMBER: default length 11 ;
  2) ORM.FLOAT
  3) ORM.STRING: default length 255 ;
  4) ORM.DATE
  
  PS: You can use the support type string, or use OrmObj.TYPENAME.

- Int `length`

  The length of 'NUMBER' and 'STRING' can be reset by this.
  
- String `name` 
 
  If use 'name', table will be created with using this name as the column name.

- Boolean `primaryKey` 
 
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
 
  If you don't want a sequence index, set `false`. The Object can have these properties:
 
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
 
### <a name="ormexecute"></a> 3.3.6 execute()

##### Prototype
Promise:
```
 promise = execute( String sql, [ Object/Array bindParams, [ Object options ] ] );
```

##### Description
  This call executes a SQL or PL/SQL statement. 
  
  A callback function returns a `result` object, containing any fetched rows, the values of any OUT and IN OUT bind variables, and the number of rows affected by the execution of DML statements.

##### Parameters
```
String sql
```
  The SQL or PL/SQL statement that `execute()` executes. The statement may contain bind variables.
```
Object/Array bindParams
```
This `execute()` function parameter is needed if there are bind variables in the statement, or if `options` are used. 
  
It can be either an object that associates values to the statement's bind variables by name, or an array of values that associate to the statement's bind variables by their relative positions. 
  
It use like: 
```
   ORM.execute(
    'INSERT INTO countries VALUES (:country_id, :country_name)',
    {country_id: 90, country_name: "Tonga"},
    options
   ).then(function(result){
     //Deal with result.
   }).catch(function(error){
     //Deal with error.
   });
   
   //****OR****
   
   ORM.execute(
       'INSERT INTO countries VALUES (:country_id, :country_name)',
       [ 90, "Tonga"],
       options
      ).then(function(result){
        //Deal with result.
      }).catch(function(error){
        //Deal with error.
      });
```
PS: `bindParams` is needed if `options` are used. 
```
Object options
```
This is an optional parameter to execute() that may be used to control statement execution.
  
If there are no bind variables in the SQL statement, then a null bindParams, for example {}, must be specified before options.
  
The properties which can be set or overridden for the execution of a statement are same as [ORM.opt](#ormopt).
  
##### Callback
Success return `Object result`. If catch error, return Error.
  
The properties of `result` object from the execute() promise are described below.
  
- Array `rows` 
    
  For `SELECT` statements, `rows` contains an array of fetched rows. It will be NULL if there is an error or the SQL statement was not a `SELECT` statement. 
    
  The rows are an array of column value object.  The number of rows returned is limited to the `maxRows` configuration property.
    
- Array `metaData` 
  
  For SELECT statements, this contains an array of objects describing details of columns for the select list. For non queries, this property is undefined.
  
  Each column's name is always given. If the Oracledb extendedMetaData or execute() option extendedMetaData are true then additional information is included.
  
    1. name: The column name follows Oracle's standard name-casing rules. It will commonly be uppercase, since most applications create tables using unquoted, case-insensitive names.
    2. fetchType: one of the Node-oracledb Type Constant values.
    3. dbType: one of the Oracle Database Type Constant values.
    4. byteSize: the database byte size. This is only set for DB_TYPE_VARCHAR, DB_TYPE_CHAR and DB_TYPE_RAW column types.
    5. precision: set only for DB_TYPE_NUMBER, DB_TYPE_TIMESTAMP, DB_TYPE_TIMESTAMP_TZ and DB_TYPE_TIMESTAMP_LTZ columns.
    6. scale: set only for DB_TYPE_NUMBER columns.
    7. nullable: indicates whether NULL values are permitted for this column.

- Array/Object `outBinds` 
  
  This is either an array or an object containing OUT and IN OUT bind values. If bindParams is passed as an array, then outBinds is returned as an array. If bindParams is passed as an object, then outBinds is returned as an object.
  
- Integer `rowsAffected` 
  
  For DML statements (including SELECT FOR UPDATE) this contains the number of rows affected, for example the number of rows inserted. For non-DML statements such as queries, or if no rows are affected, then rowsAffected will be zero.
  
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

- Object `where` [required] 
 
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
- Object `where` [required]
 
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
    
    - Model `model` `required` 
    
      The table Model object, which is going to be related.
   
    - String `use` `required` 
   
      The key column of the parent table.
   
    - String `on` `required` 
   
      The key column of the related table.
   
    - Object `where`
    
      The object of `where` to filter rows of related table.
   
    - Array[String] `attributes` 
   
      If set, only columns matching those in fields will be selected.
   
   - Boolean `notRequired` 
   
     If true, parent table will `left join` related table.
   
   - Array[Object] `include` 
   
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
- Object `where` 
 
  Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

- Array[String] `fields` 
 
  If set, only columns matching those in fields will be selected.

- Array[String]/String `order` 
 
  If set, selected rows while order by them/it, `String` like ' id desc '.

- Integer `limit` 
 
  If set, only return first `limit` rows.

- Integer `offset` 
 
  If set, return rows from the `offset` row.
 
- Array[Object] `include` 
 
  If set, relate other tables. Object as follows.
    
   - Model `model` `required` 
    
     The table Model object, which is going to be related.
    
   - String `use` `required` 
    
     The key column of the parent table.
   
   - String `on` `required` 
   
     The key column of the related table.
   
   - Object `where`
   
     The object of `where` to filter rows of related table.
   
   - Array[String] `attributes` 
   
     If set, only columns matching those in fields will be selected.
   
   - Boolean `notRequired` 
   
     If true, parent table will `left join` related table.
   
   - Array[Object] `include` 
   
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
- Object `where` 
 
  Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

- Array[String] `fields` 
 
  If set, only columns matching those in fields will be selected.

- Array[String]/String `order` 
 
  If set, selected rows while order by them/it, `String` like ' id desc '.

- Integer `limit` 
 
  If set, only return first `limit` rows.

- Integer `offset` 
 
  If set, return rows from the `offset` row.
 
- Array[Object] `include` 
 
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
 ```
 {
    all: [Integer],
    rows: [ Array[Object] ]
 }
 ```
Error, return Error.

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
Success, return `Object` which has two parameters; 
 
 ```
 Integer flag
 ```
 It meens the method did `INSERT` if 0 and `UPDATE` if 1.

 ```
 Integer/Array result
 ```
 It is `Array` if the method did `INSERT`, and is `Integer` if did `UPDATE`.
 
 Error, return Error.
 
### <a name="modelfindorinsert"></a> 4.3.8 findorInsert()

##### Prototype
Promise:
```
promise = findorInsert( Array [Object value], Object options );
```

##### Description
  This method will find rows which are match the `where` options first. If cannot find any rows, `insert()` values. Else if can find, `findAll()` rows. This method has 2 affair.

##### Parameters
```
 Object values
```
  Object's keys are column name, and values are data to be inserted.
```
 Object options
```
- Array[String] `fields` 
 
  If set, only columns matching those in fields will be inserted.
 
- Object `where` 
 
  Set filter for this method, details of `where` in [Appendix where](#appendixwhere)

- Array[String] `fields` 
 
  If set, only columns matching those in fields will be selected.

- Array[String]/String `order` 
 
  If set, selected rows while order by them/it, `String` like ' id desc '.

- Integer `limit` 
 
  If set, only return first `limit` rows.

- Integer `offset` 
 
  If set, return rows from the `offset` row.
 
- Array[Object] `include` 
 
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
 
 Success, return `Object` which has two parameters; 
 
 ```
 Integer flag
 ```
 It meens the method did `INSERT` if 0 and `SELECT` if 1.

 ```
 Array result
 ```
 If the method did `INSERT`, result is the keys of rows which are inserted. And if `SELECT`, it is the rows of selected.
 
 Error, return Error.
 
### <a name="modelcount"></a> 4.3.9 count()

##### Prototype
Promise:
 ```
 promise = count( [Object options] );
 ```

##### Description
  This method count rows in the table. If set `options`, only count rows which are match the options. This method has 1 affair.

##### Parameters
 ```
 Object options
 ```
- Object `where` 
 
  Set filter for this method, details of `where` in [Appendix where](#appendixwhere)
 
- Array[Object] `include` 
 
  If set, relate other tables. Object as follows.
    
   - Model model `required` 
   
     The table Model object, which is going to be related.
   
   - String use `required` 
   
     The key column of the parent table.
   
   - String on `required` 
   
     The key column of the related table.
   
   - Object where
   
     The object of `where` to filter rows of related table.
   
   - Boolean notRequired 
   
     If true, parent table will `left join` related table.
   
   - Array[Object] include 
   
     If set, relate other tables.
 
##### Callback
   Success, return `Integer` : the `COUNT` of the selected rows.
   
   Error, return Error.

### <a name="modelmax"></a> 4.3.10 max()

##### Prototype
Promise:
 ```
 promise = max( String field [, Object options ]);
 ```

##### Description
  This method find max of the `field` in the table. If set `options`, only find from rows which are match the options. This method has 1 affair.

##### Parameters
```
 Object options
```
 Same as the `options` in [count()](#parameters-13).

##### Callback
   Success, return the `MAX` field in the selected rows.
   
   Error, return Error.

### <a name="modelmin"></a> 4.3.11 min()

##### Prototype
Promise:
 ```
 promise = min( String field [, Object options ]);
 ```

##### Description
  This method find min of the `field` in the table. If set `options`, only find from rows which are match the options. This method has 1 affair.

##### Parameters
```
 Object options
```
 Same as the `options` in [count()](#parameters-13).

##### Callback
   Success, return the `MIN` field in the selected rows.
   
   Error, return Error.

### <a name="modelsum"></a> 4.3.12 sum()

##### Prototype
Promise:
 ```
 promise = sum( String field [, Object options ]);
 ```

##### Description
  This method sums the `field` in the table. If set `options`, only sums from rows which are match the options. This method has 1 affair.

##### Parameters
```
 Object options
```
 Same as the `options` in [count()](#parameters-13).
 
##### Callback
   Success, return the `SUM` of all fieldes in the selected rows.
   
   Error, return Error.

### <a name="modeldrop"></a> 4.3.13 drop()

##### Prototype
Promise:
```
 promise = drop( );
```

##### Description
  This method drop the table of this Model. This method has 1 affair.

##### Callback
   Success, return 0.

   Error, return Error.
   
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

   TS: 
   - ( logic11 and ( logic22 or logic33 ))
   
   PS: 
   - logic1 like `id : { $gt: 12}`; 
   - logic11 like `id > 12` .
