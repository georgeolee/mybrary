//environment variables for dev
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
// const bodyParser = require('body-parser')

//routers
const indexRouter = require('./routes/index')
const authorsRouter = require('./routes/authors')
const booksRouter = require('./routes/books')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views') //server rendered views
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public')) //public views
app.use(express.urlencoded({limit:'10mb', extended:false}))
app.use(methodOverride('_method'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('connected to mongoose'))

app.use('/', indexRouter)
app.use('/authors', authorsRouter)
app.use('/books', booksRouter)

app.listen(process.env.PORT || 3000)