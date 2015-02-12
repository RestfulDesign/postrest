# postrest
Postgres REST client

## usage

```js

var postrest = require('postrest');

// connect to database 'bookstore' using schema 'v1'
var bookstore = postrest('http://127.0.0.1:80/bookstore#v1');

```

raw sql query
```js
var result = bookstore.sql('select row_to_json(t) from books as t');

result.valueOf();
/*
[ { id: 1,
    data: { name: 'Book the First', author: [Object] } },
  { id: 2,
    data: 
     { name: 'Book the Second',
       author: [Object] } },
  { id: 3,
    data: { name: 'Book the Third', author: [Object] } } ]
*/
```

select shorthand using get method
```js
bookstore.sql.get("books").then(function(result){
       console.log("%j", result);
    }).catch(error){
       console.log("error: %j", error);
       console.log(error);
    };
```

using postgresql json operators with limit option
```js
bookstore.sql.get("books/data->'author'->>'last_name'='Xavier'&-limit=1")
   .then(function(result) {
     console.log(result.length);
   
     // iterate over rows
     result.forEach(function(row){
        console.log(row);
         // -> [ { id: 2, data: { name: 'Book the Second',author: [Object] } } ]
     });
    }, function(error){
      console.log("error", error);
    });
 
```
    

using the query builder (squel)
  ```js
  bookstore.sql.select().field('data').from('books').exec()
    .then(function(res){console.log("%j",res)});
    
  /*
       [
          {"name":"Book the First","author":{"first_name":"Bob","last_name":"White"}},
          {"name":"Book the Second","author":{"first_name":"Charles","last_name":"Xavier"}},
          {"name":"Book the Third","author":{"first_name":"Jim","last_name":"Brown"}}
       ]
  */
  ```
  
  You can read about how to use squel at https://github.com/hiddentao/squel
  
  




