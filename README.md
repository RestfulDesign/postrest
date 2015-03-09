# postrest
PostgreSQL Restful Client that can be used from io.js/nodejs or browsers.


## usage
NOTE: This project is currently in a volatile state and will get fully documented once the postgreSQL [REST service](#restadapter) has been realased.

```js
  var postrest = require('postrest');
  
  // Connect to database and perform some actions
  postrest.Connection('http://tester:tester@127.0.0.1:8080/testdb')
    .then(listDatabases)
    .spread(selectLast)
    .then(showTables)
    .catch(onError);
    
    function listDatabases(db){
      return [db,db.database.list()];
    }
    
    function selectLast(db,res){
      console.log("status:", res.status);     // http status code
      console.log("headers: %j", res.headers);// server headers 
      console.log("count:", res.count);       // result count
      console.log("result: %j", res.result);  // result items (undefined if count == 0, array if count > 1)
      var database = res.result[res.count-1].database; // pick last result list item
      
      return db.useDatabase(database); // create and return new database session
    });
    
    function showTables(db){
      db.database.tables(function(res){
        console.log("tables: %j", res.result);
    
      });
      
      return db;
    }
    
    function onError(error){
      console.log("error:", error);
    }
```

Postrest returns bluebird promises, read more about the bluebird API here: https://github.com/petkaantonov/bluebird/blob/master/API.md


```js

var postrest = require('postrest');

// connect to database 'bookstore' using schema 'v1' and with credentials passed in separately
postrest.Connection('http://127.0.0.1:80/bookstore#v1',{username:'librarian', password:'monkey'}).then(bookstore);

```

raw sql query
```js
function bookstore(db){
  db.sql('select row_to_json(t) from books as t')
    .then(function(res){
      console.log("books: %j",res.result);
    });
}
```

select shorthand using get method
```js
  db.sql.get("books").then(function(res){
       console.log("books: %j", res.result);
    }).catch(error){
       console.log("error: %j", error);
       console.log(error);
    };
```

using postgresql json operators with limit option
```js
db.sql.get("books/data->'author'->>'last_name'='Xavier'&-limit=1")
   .then(function(res) {
     // iterate over rows
     res.result.forEach(function(book,index){
        console.log("book %s: %j", index, book);
     });
    }, function(error){
      console.log("error", error);
    });
 
```

using the query builder (squel)
```js
  db.sql.select().field('data').from('books').exec()
    .then(console.log);
```
  
Postrest uses the SQuel SQL builder, read more about that here: https://github.com/hiddentao/squel

# REST adapter
This client uses a postgreSQL REST adapter which translates queries from http REST format to postgreSQL native protocol. 
The adapter is currently not open sourced (and may never be) but it is planned to be released as a restful database SaaS.
Send an email to; contact at restfuldesign dot com, if you want to know more about that.
  




