const mongoose = require('mongoose');
const BlogPost = mongoose.Schema({
    pageurl: String,
    pageNavText: String,
    pageTitle: String,
    pageDescription: String,
    pageKeyword: String,
    pageHeading: String,  
    pagePhoto: String,
    PageDetails: String,
});
module.exports = mongoose.model('BlogPost', BlogPost);

// pageUrl pageNavText pageTitle pageMetaDescription :
// String,
// : String,
// : String,
// String,
// PageMetaKeyWord
// pageHeading
// pagePhoto pageDetails
// : String,
// String,
// String
// String