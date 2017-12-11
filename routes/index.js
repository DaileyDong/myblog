//引入Users集合操作方法
var User=require('../model/User');
//引入加密插件
var crypto=require('crypto');

module.exports = function (app) {
  //首页
  app.get('/',function (req,res) {
        res.render('index',{
            title:'首页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //注册页
    app.get('/reg',function (req,res) {
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
                req.flash('error','用户已存在');
                return res.redirect('/reg');
            }
            newUser.save(function (err,user) {
                if(err){
                    req.flash('error',err);
                    res.redirect('/reg');
                }
                req.session.user=newUser;
                req.flash('success','注册成功');
                res.redirect('/');
            })
        })
        //5、将用户存入数据库，并跳转到首页
    })

    //登录页
    app.get('/login',function (req,res) {
        res.render('login',{
            title:'登录页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //登录行为
    app.post('/login',function (req,res) {

    })

    //发表页
    app.get('/post',function (req,res) {
        res.render('post',{
            title:'发表页',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        })
    })
    //发表行为
    app.post('/post',function (req,res) {

    })

    //退出
    app.get('/logout',function (req,res) {
        req.session.user=null;
        req.flash('success','退出成功');
        res.redirect('/');
    })
}
