//连接数据库实例
var mongodb=require('./db');
//创建一个构造函数，命令为User，里面的username，password，email，分别为存储的用户名，密码，邮箱
function  User(user) {
    this.username=user.username;
    this.password=user.password;
    this.email=user.email;
}
module.exports=User;
//保存用户注册信息
User.prototype.save=function (callback) {
    var user= {
        username: this.username,
        password: this.password,
        email: this.email,
    }
        //打开数据库
        mongodb.open(function(err,db) {
        if(err){
            return callback(err);
        }
        //读取users集合
        db.collection('users',function (err,collection) {
          if(err){
              mongodb.close();
              return callback(err);
          }
          //将数据插入到users集合中
          collection.insert(user,{safe:true},function(err,user) {
              mongodb.close();
              if(err){
                  return callback(err);
              }
              callback(null,user[0]);
          })

        })
    })
    }
    //读取用户信息
User.get=function (username,callback) {
    //打开数据库
    mongodb.open(function (err,db) {
        if(err){
            return callback(err);
        }
        db.collection('users',function (err,collection) {
            if(err){
                mongodb.close();
                return callback(err);
            }
            //查询name指定信息，并返回
            collection.findOne({username:username},function (err,user) {
                mongodb.close();
                if(err){
                    return callback(err);
                }
                return callback(null,user);
            })
        } )
    })
}