const express=require('express');

const router=express.Router();                             
 
const Post=require('../models/Post');        //MODEL
const User=require('../models/User');      //MODEL

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret=process.env.JWT_SECRET;

 const adminLayout = '../views/layouts/admin';          //  important  // means admin.ejs vala page hi show hoga site par hamesha bas <%- body  %> change hoti raegi ( jaise main.ejs ka tha )


 /**
 * 
 * Check Login
*/
const authMiddleware = (req, res, next ) => {
    const token = req.cookies.token;
  
    if(!token) {
      return res.status(401).json( { message: 'Unauthorized'} );
    }
  
    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      next();
    } catch(error) {
      res.status(401).json( { message: 'Unauthorized'} );
    }
  }




/**
 * GET /
 * Admin -Login Page
*/
  
  router.get('/admin',async(req,res)=>{
    
    try{
        const locals={ 
            title:"Admin",
            description:"Simple Blog created "
        }
     res.render('admin/index',{locals, layout: adminLayout});    //  important  // means admin.ejs vala page hi show hoga site par hamesha bas <%- body  %> change hoti raegi ( jaise main.ejs ka tha )
    }catch(err){
      console.log(err);
    }
  //res.render('index',{locals});                          //jab 127.0.0.1:5000  res.render se puri index.ejs file aajegi (display hogi site par 127.0.0.1:5000/)
  });
  

  /**
 * POST /
 * Admin - Check Login
*/
/*
router.post('/admin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if(req.body.username=== 'admin' && req.body.password === 'password'){
        res.send('loggied IN')
      }else{
        res.send('wrong password')
      }
      
    } catch (error) {
        console.log(error);
      }
    });
*/


/**
 * POST /
 * Admin - Check Login
*/
router.post('/admin', async (req, res) => {          //router.post('/admin'  means ye isse aya <form action="/admin" method="POST"> index.ejs file m
    try {
      const { username, password } = req.body;
    

      const user = await User.findOne( { username } );
  
      if(!user) {     // Login karte hue ckeck ki database m vo username h kya nahi (agar nahi h to error do)
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
                // if username h database m then check for password ki jo hmmne dala h login karte hue vo database vale password se match karta h ya nahi
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if(!isPasswordValid) {
        return res.status(401).json( { message: 'Invalid credentials' } );
      }
  
      const token = jwt.sign({ userId: user._id}, jwtSecret );
      res.cookie('token', token, { httpOnly: true });
      
      res.redirect('/dashboard');
  
    } catch (error) {
      console.log(error);
    }
  });


/**
 * GET /
 * Admin Dashboard
*/
router.get('/dashboard',  authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Dashboard',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/dashboard', {
        locals,
        data,
        layout: adminLayout              //  important  // means admin.ejs vala page hi show hoga site par hamesha bas <%- body  %> change hoti raegi ( jaise main.ejs ka tha )
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {                     //dashboard.ejs vale page m    <a href="/add-post" class="button">+ Add New</a>  ye h tabhi jab anchor tag k href se aya /add-post
    try {
      const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/add-post', {
        locals,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
  

/**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {         //add-post.ejs vale page se aya   //router.post('/add-post'  means ye isse aya <form action="/add-post" method="POST"> add-post.ejs file m
    try {
      try {
        const newPost = new Post({
          title: req.body.title,
          body: req.body.body
        });
  
        await Post.create(newPost);
        res.redirect('/dashboard');
      } catch (error) {
        console.log(error);
      }
  
    } catch (error) {
      console.log(error);
    }
  });
  

  /**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {                  //dashboard.ejs vale page m     <a href="/edit-post/<%= post._id %>" class="btn">Edit</a>  ye h tabhi jab anchor tag k href se aya /edit-post/<%= post._id
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
  

  /**
 * PUT /
 * Admin - Create New Post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {                          //edit-post.ejs vale page se aya   //router.put('/edit-post/:id'  means ye isse aya<form action="/edit-post/<%= data._id %>?_method=PUT" method="POST"> edit-post.ejs file m
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  


/**
  * POST /
  * Admin - Register/Sign In
  * 
//   USING HASHED PASSWORD
*/
 router.post('/register', async (req, res) => {     //router.post('/register'  means ye isse aya <form action="/register" method="POST"> index.ejs file m
   try {
     const { username, password } = req.body;
     const hashedPassword = await bcrypt.hash(password, 10);
 
     try {
       const user = await User.create({ username, password:hashedPassword });   //User.create (here User is MODEL that is defined above)   User.create => means inserting into database
       res.status(201).json({ message: 'User Created', user });
     } catch (error) {
       if(error.code === 11000) {
         res.status(409).json({ message: 'User already in use'});
       }
       res.status(500).json({ message: 'Internal server error'})
     }
 
   } catch (error) {
     console.log(error);
   }
 });

 /**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {             //router.delete('/delete-post/:id',  means ye isse aya   <form action="/delete-post/<%= data._id %>?_method=DELETE" method="POST">      edit-post.ejs file or dashboard.ejs file se

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  

  /**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {                   //  router.get('/logout'  ye aya <a href="/logout">Logout</a>   header_admin.ejs se
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });


module.exports=router; 