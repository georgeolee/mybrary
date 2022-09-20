const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})

authorSchema.pre('remove', function(next){
    Book.find({author: this.id}, (err, books) => {
        if(err){//error finding
            next(err)
        }else if(books.length > 0){ //author has books still
            next(new Error('this author has books still'))
        }else{
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema)