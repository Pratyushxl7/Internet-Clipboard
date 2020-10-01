//Headers
var express=require("express");
var bodyParser=require("body-parser");
var methodOverride=require("method-override");
var expressSanitizer=require('express-sanitizer');
var mongoose=require("mongoose");
var app=express();

//Connections and flexibility
var name_of_db="Restful_Blog_App";
var password="suzukixl7";

mongoose.connect("mongodb+srv://Pratyush:"+password+"@cluster0-yxbyk.mongodb.net/"+name_of_db+"?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Structure of a post in the blog
var blogSchema= new mongoose.Schema({
	title: String, image: String, body: String, created: {type: Date, default: Date.now}
});

//Creating the DB
var Blog=mongoose.model("Blog", blogSchema);

//Creating just one post to look at
// Blog.create({title:"Blog 1", image: "https://flic.kr/p/LhQxYb", body:"I went here today!"});

//RESTFUL Routes
app.get("/", function(request, response)
{
	response.render("homepage");
});

//Index Route
app.get("/blogs", function(request, response)
{
	Blog.find({}, function(err, items_ret){
		if(err)
		{
			console.log("Error--->"+ err);
		}
		else
		{
				response.render("index", {passedPosts: items_ret});
		}
	});

});

//New Route
app.get("/blogs/new", function(request, response)
{
	response.render("new");
});

//Create Route
app.post("/blogs", function(request, response)
{
	//Create the blog
	request.body.blog.body=request.sanitize(request.body.blog.body);
	Blog.create(request.body.blog, function(err, newBlog){
		if(err)
		{
			//If creation failed, redirect to create page again
			response.render("new");
		}
		else
		{
			//Redirect to blog page
			response.redirect("/blogs");
		}
	})
});

//Show Route
app.get("/blogs/:id", function(request, response){
	Blog.findById(request.params.id, function(err, foundBlog){
		if(err)
		{
			response.redirect("/blogs");
		}
		else
		{
			response.render("show", {blog:foundBlog});
		}
	})
});

//Edit Route
app.get("/blogs/:id/edit", function(request, response)
{
	Blog.findById(request.params.id, function(err, blogtoEdit){
		if(err)
		{
			response.redirect("/blogs");
		}
		else
		{
			response.render("edit", {blog:blogtoEdit});
		}
	})});

//Update Route
app.put("/blogs/:id", function(request, response){
	request.body.blog.body=request.sanitize(request.body.blog.body);
	Blog.findByIdAndUpdate(request.params.id, request.body.blog, function(err, blogtoEdit){
		if(err)
		{
			response.redirect("/blogs");
		}
		else
		{
			response.redirect("/blogs/"+request.params.id);
		}
	})});

//Delete Route
app.delete("/blogs/:id", function(request, response){
	Blog.deleteOne({_id:request.params.id}, function(err){
		if(err)
		{
			response.redirect("/blogs");
		}
		else
		{
			response.redirect("/blogs");
		}
	})});
app.listen(3000, process.env.IP, function(){
	console.log("Server has started!");
});