var mongodb=require('./db');
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
        time: now
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
                callback(null, post[0]);
            })
        })
    })
}
    //读取post集合
    Post.get = function(username, callback) {
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
                if (username) {
                    query.username = username;
                }
                //根据 query 对象查询文章
                collection.find(query).sort({
                    time: -1
                }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        return callback(err);//失败！返回 err
                    }
                    callback(null, docs);//成功！以数组形式返回查询的结果
                });
            });
        });
    //插入数据，并跳转到首页

}

module.exports=Post;