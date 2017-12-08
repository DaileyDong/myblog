//连接数据库的文件
//引入数据库配置文件
var setting=require('../setting');
//引入mongodb模块下的Db对象
var Db=require('mongodb').Db;
//引入mongodb模块下的server对象
var Server=require('mongodb').Server;
//数据库的实例对象
module.exports=new Db(setting.db,new Server(setting.host,setting.port),{safe:true})