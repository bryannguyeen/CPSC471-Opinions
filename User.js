//initiallzing class
class User
{

  constructor()
  {
    this.username = "";
    this.numSubscriptions = 0;
    this.prestigeScore = 0;
    this.password = "";
  }

  get username()
  {
    return this.username;
  }

  get numSubscriptions()
  {
    return this.numSubscriptions;
  }

  get prestigeScore()
  {
    return this.prestigeScore;
  }

  set username(usernameVal)
  {
    this._username = usernameVal;
  }

  set numSupscriptions(numSubscriptionsVal)
  {
    this._numSubscriptions = numSubscriptionsVal;
  }

  set prestigeScore(prestigeScoreVal)
  {
    this._prestigeScore = prestigeScoreVal;
  }

  get password()
  {
    return this.password;
  }

  set password(passwordVal)
  {
    this._password = passwordVal;
  }




}


class Moderator extends User
{
  constructor()
  {
    this.numGroupsModerate = 0;
  }

  get numGroupsModerate()
  {
    return this.numGroupsModerate;
  }

  set numGroupsModerate(numGroupsModerateVal)
  {
    this._numGroupsModerate = numGroupsModerateVal;
  }
}

class Administrator extends Moderator
{
  constructor()
  {
    this.numGroupsAdmin = 0;
  }

  get numGroupsAdmin()
  {
    return this.numGroupsAdmin;
  }

  set numGroupsAdmin(numGroupsAdminVal)
  {
    this._numGroupsAdmin = numGroupsAdminVal;
  }
}


module.exports.User = User;
module.exports.Administrator = Administrator;
module.exports.Moderator = Moderator;
