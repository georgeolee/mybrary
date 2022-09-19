const express = require('express')  // import express from module
const router = express.Router()     // create new Router
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const Book = require('../models/book')
const uploadPath = path.join('public', Book.coverImageBasePath)
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})
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

//add new book to collection

router.post('/', upload.single('cover'), async (req, res) => { // root -> REST post acts on entire collection
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        coverImageName: fileName
    })

    try{
        const newBook = await book.save()
        //res.redirect(`books/${newBook.id}`)
        res.redirect('books')
    }catch(err){
        console.log(err)
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }        
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = 'error creating book'
        res.render('books/new', params)
    }catch{
        res.redirect('/books')
    }    
}
module.exports = router