var User = require('./User.js');
const sqlite3 = require('../sqlite3').verbose();
let db = new sqlite3.Database('./db/USER.TABLE');


class UserList
{
  constructor(){}

  insertUser(Username,Password)
  {
    var user = User.setName(Username);
    user = User.setPassword(Password);
    var createTable = 'CREATE TABLE [IF NOT EXISTS] [user].user_table';
    var userName = 'username data_type PRIMARY KEY';
    var userPassword 'password data_type NOT NULL';
    var createTable = createTable.concat('(', userName, ', ', userPassword, ', ', 'table_constraint) [WITHOUT ROWID]');

/*    var userCheck = 'IF NOT EXISTS (SELECT * FROM user.objects WHERE user = USER_TABLE(N\'user.usertables\') AND type in (N\'U\'))';
    var userCreate = 'CREATE TABLE user.usertables';
    var INSERT_INTO = 'INSERT_INTO'
    var USER_TABLE = 'USER_TABLE';*/
    var userInsert = INSERT_INTO.concat
    db.transaction(function (tx)
                  {
                    tx.excuteSql(createTable);
                  }
                );


  }




}
