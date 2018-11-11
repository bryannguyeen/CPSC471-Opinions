class Comment
{
  constructor()
  {
    this.body = "";
    this.NSFW = false;
    this.timeStamp = 0;
    this.commentID = 0;
  }

  get body()
  {
    return this.body;
  }

  get NSFW()
  {
    return this.NSFW;
  }

  get timeStamp()
  {
    return this.timeStamp;
  }

  get commentID()
  {
    return this.commentID;
  }

  set body(bodyVal)
  {
    this.body = bodyVal;
  }

  set NSFW(NSFWbool)
  {
    this.NSFW = NSFWbool;
  }

  set timeStamp(timeStampVal)
  {
    this.timeStamp = timeStampVal;
  }

  set commentID(commentIDVal)
  {
    this.commentID = commentIDVal;
  }
}
