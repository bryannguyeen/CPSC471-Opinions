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
    this.score = scoreVal;
  }

  set numLikes(numLikesVal)
  {
    this.numLikes = numLikesVal;
  }

  set title(titleVal)
  {
    this.title = titleVal;
  }

  set postDate(postDateVal)
  {
    this.postDate = postDateVal;
  }

  set postID(postIDVal)
  {
    this.postID = postIDVal
  }

  set bodyText(bodyTextVal)
  {
    this.bodyText = bodyTextVal;
  }

  set NotSafeForWorkFlag(NotSafeForWorkFlagBool)
  {
    this.NotSafeForWorkFlag = NotSafeForWorkFlagBool;
  }

  set numDislikes(numDislikesVal)
  {
    this.numDislikes = numDislikesVal;
  }


}
