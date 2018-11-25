class User {
  constructor()
  {
      this.Username = Username;
      this.Password = Password;
  }

  set Password(PasswordVal)
  {
    this._Password = PasswordVal;
  }

  set Username(UsernameVal)
  {
    this._Username = UsernameVal;
  }

  get Password()
  {
    return this._Password;
  }

  get Username()
  {
    return this.Username;
  }

  

}
