var express = require("express");
var router = express.Router();
const mongoose = require('mongoose');
require('dotenv').config()
const BlogPost = require('../routes/pagemodel');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var methodOverride = require('method-override')

// Middleware to fetch navbar items
router.use(async (req, res, next) => {
  try {
      const posts = await BlogPost.find({});
      res.locals.posts = posts; // Making posts available in all HBS views
      console.log("Middleware executed!", posts);
      next();
  } catch (err) {
      console.error("Error fetching posts:", err);
      next(err);
  }
});


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/upload_image')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
});

var upload = multer({ storage: storage });


router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride('_method'))


mongoose.connect(process.env.mongourl)
  .then(() => console.log('Connected!'));


/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });

});

router.get("/admin", function (req, res, next) {
  BlogPost.find({})
    .then((pages) => {
      const pageCount = pages.length; // Count total documents
      console.log("Total Pages:", pageCount);
      res.render("admin", { x: pages, pageCount: pageCount });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching data");
      
    });

});


router.get("/admin/page", async function (req, res, next) {
  try {
    const pages = await BlogPost.find(); // Fetch all pages from MongoDB
    console.log("Data Fetched:", pages);

    res.render("page", { x: pages }); // Pass data to HBS template
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }

});



router.get("/admin/add-page-file", function (req, res, next) {
  res.render("add-page-file", { title: "Admin Page" });
});


router.post("/admin/add-page-file", upload.single("page_Photo"), async function (req, res, next) {
  try {
    const blogPost = new BlogPost({
      pageurl: req.body.page_url,
      pageNavText: req.body.page_NavDisplay,
      pageTitle: req.body.page_Title,
      pageDescription: req.body.page_Description,
      pageKeyword: req.body.page_Keyword,
      pageHeading: req.body.page_Heading,
      pagePhoto: req.file.filename,
      PageDetails: req.body.page_Details.slice(0, 100) + "...",
    });
    
    
    await blogPost.save();
    // req.flash("danger", "Page Added Successfully");
    // console.log(req.flash("danger", "Page Added Successfully"));
    
    console.log("Saved successfully!");
    res.redirect("/admin/page");


  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).send("Error saving data");
  }

});

router.get("/admin/delete/:pageurl", async function (req, res, next) {
  try {
    const pageurl = req.params.pageurl;
    console.log("Delete request received for ID:", pageurl);

    const page = await BlogPost.findOneAndDelete({pageurl : pageurl});
    
    if (!page) {
      console.log("No document found with this ID.");
      return res.status(404).send("Page not found");
    }

    console.log("Deleted successfully!");
    res.redirect("/admin/page");
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Error deleting data");
  }
});


router.get("/admin/edit/:pageurl", async function (req, res) {
  try {
    const pageurl = req.params.pageurl;
    console.log("Edit request received for:", pageurl);
    
    const page = await BlogPost.findOne({ pageurl: pageurl });
    if (!page) {
      console.log("No document found.");
      return res.status(404).send("Page not found");
    }
    
    res.render("edit", { x: page });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});

// Update Page - Handle Form Submission
router.put("/admin/edit/:pageurl", upload.single("page_Photo"), async function (req, res) {
  try {
    const pageurl = req.params.pageurl;
    console.log("Edit request received for:", pageurl);
    
    let updateData = {
      pageurl: req.body.page_url,
      pageNavText: req.body.page_NavDisplay,
      pageTitle: req.body.page_Title,
      pageDescription: req.body.page_Description,
      pageKeyword: req.body.page_Keyword,
      pageHeading: req.body.page_Heading,
      PageDetails: req.body.page_Details.slice(0, 100) + "...",
    };

    // Check if a new photo is uploaded
    if (req.file) {
      updateData.pagePhoto = req.file.filename;
    }

    const updatedPage = await BlogPost.updateOne({ pageurl: pageurl }, { $set: updateData });

    if (updatedPage.matchedCount === 0) {
      console.log("No document found.");
      return res.status(404).send("Page not found");
    }

    console.log("Page updated:", updatedPage);
    res.redirect("/admin/page");
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Error updating data");
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const pageurl = req.params.id;
    console.log("Request received for:", pageurl);
    const page = await BlogPost.findOne({ pageurl: pageurl });
    if (!page) {    
      return res.status(404).send("Page not found");
    }
    res.render("dynamic-page", { x: page });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching data");
  }
});




module.exports = router;



