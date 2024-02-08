
# Shortlink

Simple shortlink with express js and others


## NOTE

[EN]
if you can create an interface for this shortlink you can pull request this repo

[ID]
jika anda bisa membuat interface untuk shortlink ini anda bisa pull request repo ini


## Demo

https://s.deanry.my.id
## Deployment

To deploy this project run

```bash
  npm i
  node index.js
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB URL`


## Post Shorturl

```javascript
var axios = require("axios").default;

var options = {
  method: 'POST',
  url: 'http://localhost:3000/shorten',
  headers: {
    Accept: '*/*',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; SM-J500G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Mobile Safari/537.36',
    'Content-Type': 'application/json'
  },
  data: {originalUrl: 'https://deanry.my.id'}
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
```


## Authors

- [@imrasya](https://www.github.com/imrasya)

