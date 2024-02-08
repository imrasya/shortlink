if (process.env.NODE_ENV) {
    require('dotenv').config({
        path: `${__dirname}/.env.${process.env.NODE_ENV}`
    })
} else  {
    require('dotenv').config()
}


console.log(process.env.DB_URL);
console.log(process.env.NODE_ENV);