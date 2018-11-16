class Country
{
  constructor()
  {
    this.country = "";
  }

  get country()
  {
    return this.country;
  }

  set country(countryVal)
  {
    this._country = countryVal;
  }
}


module.exports.Country = Country;
