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
    return this._body;
  }

  get NSFW()
  {
    return this._NSFW;
  }

  get timeStamp()
  {
    return this._timeStamp;
  }

  get commentID()
  {
    return this._commentID;
  }

  set body(bodyVal)
  {
    this._body = bodyVal;
  }

  set NSFW(NSFWbool)
  {
    this._NSFW = NSFWbool;
  }

  set timeStamp(timeStampVal)
  {
    this._timeStamp = timeStampVal;
  }

  set commentID(commentIDVal)
  {
    this._commentID = commentIDVal;
  }
}

module.exports.Comment = Comment;
