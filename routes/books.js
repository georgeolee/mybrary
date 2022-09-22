const express = require('express')  // import express from module
const router = express.Router()     // create new Router
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

//all books route
router.get('/', async (req, res) => {

    let query = Book.find()
    if(req.query.title){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publishedAfter){
        query = query.gte('publishDate', req.query.publishedAfter)
    }

    try{
        const books = await query.exec() //execute query
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }
    
})

//new books route - display form to create new book
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// edit book route
router.get('/:id/edit', async (req, res) => {
    // res.send(`edit book ${req.params.id}`)

    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book)
    }catch{
        res.redirect('/')
    }
})

// show book route
router.get('/:id', async (req, res) => {
    try{
        const book = await Book
                            .findById(req.params.id)
                            .populate('author') //populate expands author field in the book from an object id to a full author object
                            .exec()
        res.render('books/show', {book: book})
    }catch{
        res.redirect('/')
    }
})

//add new book to collection

router.post('/',  async (req, res) => { // root -> REST post acts on entire collection
    const book = new Book({
        title: req.body.title,
        author: req.body.author, //set to an id value for author ; see form fields & model
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })

    saveCover(book, req.body.cover)

    try{
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    }catch(err){
        console.log(err)

        renderNewPage(res, book, true)
    }
})

//update book
router.put('/:id',  async (req, res) => { // root -> REST post acts on entire collection
    
    let book

    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = book.title = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.description = req.body.description

        if(req.body.cover){
            saveCover(book, req.body.cover)
        }

        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch(e){
        console.log(e)

        if(book != null){
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }    



    try{
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    }catch(err){
        console.log(err)

        renderNewPage(res, book, true)
    }
})

//delete book
router.delete('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id)
        await book.remove();
        res.redirect('/books/')
    }catch{
        if(book == null){//book not found
            res.redirect('/')
        }else{//book exists, but some other error
            res.redirect(`/books/${book.id}`)
        }
    }
})


async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book,form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError){
            if(form === 'edit'){
                params.errorMessage = 'error editing book'
            }else{
                params.errorMessage = 'error creating book'
            }
        }
                
        res.render(`books/${form}`, params)
    }catch{
        res.redirect('/books')
    }    
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router