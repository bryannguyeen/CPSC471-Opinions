class Group
{
  constructor()
  {
    this.groupName = "";
    this.description = "";
  }

  get groupName()
  {
    return this.groupName;
  }

  set groupName(groupNameVal)
  {
    this._groupName = groupNameVal;
  }

  get description()
  {
    return this.description;
  }

  set description(descriptionVal)
  {
    this._description = descriptionVal;
  }


}

module.exports.Group = Group;
