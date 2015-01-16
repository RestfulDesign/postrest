# postrest
Postgres REST client

## usage

```js

var postrest = require('postrest');

// connect to database 'bookstore' using schema 'v1'
var db = postrest('http://127.0.0.1:80/bookstore#v1');

db.get("books/data->'author'->>'last_name'='Xavier'&-limit=1")
   .then(function(result) {
     console.log(result.length); // -> 1
   
     // iterate over rows
     result.forEach(function(row){
        console.log(row);
         // -> [ { id: 2, data: { name: 'Book the Second',author: [Object] } } ]
     });
    }, function(error){
      console.log("error", error);
    });
 
```






