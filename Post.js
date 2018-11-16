class Post
{
  constructor()
  {
    this.score = 0;
    this.numLikes = 0;
    this.title = "";
    this.postDate = 0;
    this.postID = 0;
    this.bodyText = "";
    this.NotSafeForWorkFlag = false;
    this.numDislikes = 0;
  }

  get score()
  {
    return this.score;
  }

  get numLikes()
  {
    return this.numLikes;
  }

  get title()
  {
    return this.title;
  }

  get postDate()
  {
    return this.postDate;
  }

  get postID()
  {
    return this.postID;
  }

  get bodyText()
  {
    return this.bodyText;
  }

  get NotSafeForWorkFlag()
  {
    return this.NotSafeForWorkFlag;
  }

  get numDislikes()
  {
    return this.numDislikes;
  }

  set score(scoreVal)
  {
    this._score = scoreVal;
  }

  set numLikes(numLikesVal)
  {
    this._numLikes = numLikesVal;
  }

  set title(titleVal)
  {
    this._title = titleVal;
  }

  set postDate(postDateVal)
  {
    this._postDate = postDateVal;
  }

  set postID(postIDVal)
  {
    this._postID = postIDVal
  }

  set bodyText(bodyTextVal)
  {
    this._bodyText = bodyTextVal;
  }

  set NotSafeForWorkFlag(NotSafeForWorkFlagBool)
  {
    this._NotSafeForWorkFlag = NotSafeForWorkFlagBool;
  }

  set numDislikes(numDislikesVal)
  {
    this._numDislikes = numDislikesVal;
  }


}
