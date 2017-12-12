//引入Users集合操作方法
var User=require('../model/User');
//引入Post集合操作方法
var Post=require('../model/Post');
//引入加密插件
var crypto=require('crypto');
//引入上传插件
var multer=require('multer');
//配置信息
var storage=multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,'./public/images');
    },
    filename:function (req,file,cb) {
        cb(null,file.originalname);
    }
});

var upload=multer({storage:storage});
//权限判断（中间件）
//未登录无法访问发表页和退出页
function checkLogin(req,res,next) {
    if(!req.session.user){
        req.flash('error','未登录！');
       return res.redirect('/login');
    }
    next();
}
//已登录无法访问登录页和注册页
function checkNotLogin(req,res,next) {
    if(req.session.user){
        req.flash('error','已登录！');
       return  res.redirect('back');
    }
    next();
}

module.exports = function (app) {
  //首页
    app.get('/',function (req,res) {
      Post.get(null,function (err,docs) {
          if(err){
              req.flash('error',err);
              return res.redirect('/');
          }
          res.render('index',{
              title:'首页',
              user:req.session.user,
              success:req.flash('success').toString(),
              error:req.flash('error').toString(),
              docs:docs
          })
      })

    })
    //注册页
    app.get('/reg',checkNotLogin,function (req,res) {
        res.render('reg',{
            title:'注册页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //注册行为
    app.post('/reg',function (req,res) {
       //把数据放到数据库
        //1、收集数据
        var username=req.body.username;
        var password=req.body.password;
        var password_repeat=req.body['password_repeat'];
        var email=req.body.email;
        //2判断是否为空
        if(!(username||password||password_repeat ||email)){
            req.flash('error','注册信息不完整！');
            return res.redirect('/reg');
        }

        //2、判断两次密码
        if(password!=password_repeat){
            req.flash('error','两次密码不一致！');
            return res.redirect('/reg');
        }
        //3、加密密码
        var md5=crypto.createHash('md5');
        password=md5.update(req.body.password).digest('hex');

        var newUser=new User({
            username:username,
            password:password,
            email:req.body.email
        })
        //4、判断用户是否存在
        User.get(newUser.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            if(user){
                req.flash('error','用户已存在!');
                return res.redirect('/reg');
            }
            //5、将用户存入数据库，并跳转到首页
            newUser.save(function (err,user) {
                if(err){
                    req.flash('error',err);
                    return  res.redirect('/reg');
                }
                req.session.user=newUser;
                req.flash('success','注册成功!');
                return  res.redirect('/');
            })
        })

    })

    //登录页
    app.get('/login',checkNotLogin,function (req,res) {
        res.render('login',{
            title:'登录页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //登录行为
    app.post('/login',function (req,res) {
        var username=req.body.username;
        // 1、对密码进行加密
        var md5=crypto.createHash('md5');
        var password=md5.update(req.body.password).digest('hex');
        //2.判断是否为空
        if(username=='' || password==''){
            req.flash('error','登录信息不完整!');
            return res.redirect('/login');
        }
        //2、判断用户是否存在
        User.get(req.body.username,function (err,user) {
            if(err){
                req.flash('error',err);
                return res.redirect('/login');
            }
            if(!user){
                req.flash('error','用户不存在！');
                return res.redirect('/login');
            }
            //3、判断密码
            if(password!=user.password){
                req.flash('error','密码不正确！');
                return res.redirect('/login');
            }
            // 4、把用户信息保存到session，给出提示信息，跳转首页
            req.session.user=user;
            req.flash('success','登录成功！');
            return res.redirect('/');
        })
    })

    //发表页
    app.get('/post',checkLogin,function (req,res) {
        res.render('post',{
            title:'发表页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //发表行为
    app.post('/post',function (req,res) {
          var currentName=req.session.user.username;
          var newPost=new Post(currentName,req.body.title,req.body.content);
          newPost.save(function (err) {
              if(err){
                  req.flash('error',err);
                  return res.redirect('/');
              }
              req.flash('success','发表成功!');
              return res.redirect('/');
          })
    })

    //上传页
    app.get('/upload',checkLogin,function (req,res) {
        res.render('upload',{
            title:'上传',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //上传行为
    app.post('/upload',upload.array('filename',5),function (req,res) {
        req.flash('success','上传成功!');
        return res.redirect('/upload');
    })
    //退出
    app.get('/logout',checkLogin,function (req,res) {
        //清除session信息，并给出提示信息，跳转到首页
        req.session.user=null;
        req.flash('success','退出成功!');
        return res.redirect('/');
    })
}
