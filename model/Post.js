var mongodb=require('./db');
//引入markdown
var markdown=require('markdown').markdown;

function Post(name,title,content) {
    this.name=name;
    this.title=title;
    this.content=content;
}

//格式化时间函数
function formatDate(num) {
   return num<10?'0'+num:num;
}
//插入数据
Post.prototype.save=function (callback) {
    //格式化时间
    var date = new Date();
    var now = date.getFullYear() + "-" + formatDate(date.getMonth() + 1) + "-" + formatDate(date.getDate()) + " " + formatDate(date.getHours()) + ":" + formatDate(date.getMinutes()) + ":" + formatDate(date.getSeconds());

    //收集数据
    var newContent = {
        name: this.name,
        title: this.title,
        content: this.content,
        time: now,
        comments:[]//添加留言
    }

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            collection.insert(newContent, function (err, post) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, post);
            })
        })
    })
}
    //读取post集合,获取所有文章
//page当前页数
    Post.getTen = function(name,page, callback) {
        //打开数据库
        mongodb.open(function (err, db) {
            if (err) {
                return callback(err);
            }
            //读取 posts 集合
            db.collection('posts', function(err, collection) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                var query = {};
                if (name) {
                    query.name = name;
                }
               collection.count(query,function (err,total) {
                   if(err){
                       mongodb.close();
                       return callback(err);
                   }
                   //根据 query 对象查询文章
                   collection.find(query,{
                       skip:(page-1)*10,
                       limit:10
                   }).sort({
                       time: -1
                   }).toArray(function (err, docs) {
                       mongodb.close();
                       if (err) {
                           return callback(err);//失败！返回 err
                       }
                       //将每篇文章在读取的时候以markdown的格式进行解析
                       docs.forEach(function (doc) {
                           doc.content=markdown.toHTML(doc.content);
                       })
                       return callback(null,docs,total);//成功！以数组形式返回查询的结果
                   });
               })
            });
        });

}
   //获取一篇文章
   Post.getOne=function (name,title,time,callback) {
       mongodb.open(function (err,db) {
           if(err){
               return callback(err);
           }
           db.collection('posts',function (err,collection) {
               if(err){
                   mongodb.close();
                   return callback(err);
               }
               collection.findOne({
                   name:name,
                   title:title,
                   time:time
               },function (err,doc) {
                   mongodb.close();
                   if(err){
                       return callback(err);
                   }
                  console.log(doc);
                   if(doc){
                       //markdown解析文章的内容
                       doc.content = markdown.toHTML(doc.content);
                       //留言的内容也要通过markdown来进行解析
                       doc.comments.forEach(function(comment){
                           comment.c_content = markdown.toHTML(comment.c_content)
                       })
                   }
                   return callback(null,doc);
               })
           })
       })
   }
   //编辑逻辑
  Post.edit=function (name,title,time,callback) {
      mongodb.open(function (err, db) {
          if (err) {
              return callback(err);
          }
          db.collection('posts', function (err, collection) {
              if (err) {
                  mongodb.close();
                  return callback(err);
              }
              collection.findOne({
                  name: name,
                  title: title,
                  time: time
              }, function (err, doc) {
                  mongodb.close();
                  if (err) {
                      return callback(err);
                  }
                  return callback(null, doc);
              })
          })
      })
  }
      //编辑
  Post.update=function (name, title, time,content, callback) {
        mongodb.open(function (err,db) {
            if(err){
                return callback(err);
            }
            db.collection('posts',function (err,collection) {
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.update({
                    name:name,
                    title:title,
                    time:time
                },{$set:{content:content}},function (err,doc) {
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    return callback(null,doc);
                })
            })
        })
      }
      //删除
  Post.remove=function (name,title,time,callback) {
         mongodb.open(function (err,db) {
             if(err){
                 return callback(err);
             }
             db.collection('posts',function (err,collection) {
                 if(err){
                     mongodb.close();
                     return callback(err);
                 }
                 collection.remove({
                     name:name,
                     title:title,
                     time:time
                 },{w:1},function (err) {
                     mongodb.close();
                     if(err){
                         return callback(err);
                     }
                    return callback(null);
                 })
             })
         })
     }
module.exports=Post;