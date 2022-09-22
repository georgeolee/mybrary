const express = require('express')  // import express from module
const router = express.Router()     // create new Router
const Author = require('../models/author')
const book = require('../models/book')

//all authors route
router.get('/', async (req, res) => {
    let searchOptions = {}

    if(req.query.name != null && req.query.name !== ''){

        //catch invalid regex pattern
        try{
            searchOptions.name = new RegExp(req.query.name, 'i')
        }catch(err){
            console.log(err)
        }
        // searchOptions.name = new RegExp(req.query.name, 'i')
    }
    
    try{
        const authors = await Author.find(searchOptions) //find all authors, no where conditions
        res.render('authors/index', {
            authors:authors, 
            searchOptions: req.query
        })
    }catch{
        res.redirect('/')
    }    
})

//new authors route - display form to create new author
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

//add new author to collection

router.post('/', async (req, res) => { // root -> REST post acts on entire collection
    const author = new Author({
        name:req.body.name
    })

    try{
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)        
    }catch{
        res.render('authors/new', {
            author: author,
            errorMessage: 'error creating author'
        })
    }
})

router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await book.find({author: author.id}).limit(6).exec()
        res.render('authors/show', {
            author: author, 
            booksByAuthor: books //booksByAuthor - variable name has to match show page
        })  
    }catch(err){
        // console.log(err)
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    
    try{        
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    }catch{
        res.redirect('/authors')
    }    
})

router.put('/:id', async (req, res) => {

    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)        
    }catch{        
        if(author == null){ //failed to find author
            res.redirect('/')
        }else{
            res.render('authors/new', {
                author: author,
                errorMessage: 'error creating author'
            })
        }        
    }
})

router.delete('/:id', async (req, res) => {
    
    let author
    try{
        author = await Author.findById(req.params.id)

        await author.remove()
        res.redirect('/authors')        
    }catch{        
        if(author == null){ //failed to find author
            res.redirect('/')
        }else{
            res.redirect(`/authors/${author.id}`)
        }        
    }
})

module.exports = router