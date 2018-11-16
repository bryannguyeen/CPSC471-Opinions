//initiallzing class
class User
{

  constructor()
  {
    this.username = "";
    this.numSubscriptions = 0;
    this.prestigeScore = 0;
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
    this.username = usernameVal;
  }

  setNumSupscriptions(numSubscriptionsVal)
  {
    this.numSubscriptions = numSubscriptionsVal;
  }

  setPrestigeScore(prestigeScoreVal)
  {
    this.prestigeScore = prestigeScoreVal;
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
    this.numGroupsModerate = numGroupsModerateVal;
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
    this.numGroupsAdmin = numGroupsAdminVal;
  }
}


module.exports.User = User;
module.exports.Administrator = Administrator;
module.exports.Moderator = Moderator;
