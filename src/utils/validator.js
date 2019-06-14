class ValidatorUtils {
  constructor() {
    this.regex = {
      email: /^[a-zA-Z0-9-_.+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      url: /^(https?:\/\/(?:www\.|(?!www))[^\s.#!:?+=&@!$'~*,;\/()[\]]+\.[^\s#!?+=&@!$'~*,;()[\]\\]{2,}\/?|www\.[^\s#!:.?+=&@!$'~*,;\/()[\]]+\.[^\s#!?+=&@!$'~*,;()[\]\\]{2,}\/?)/i,
      phone: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
      zip: /^\d{5}(?:[-\s]\d{4})?$/,
      uid: /^\d{14,}[a-z]{3}[01]{1}$/,
      username: /^[a-zA-Z0-9-_.@$+]{4,16}$/,
      password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      name: /^[a-zA-Z. -]{1,40}$/,
    };
  }

  isValidEmail(email = '') {
    return email.match(this.regex.email) !== null;
  }

  isValidUrl(url = '') {
    return url.match(this.regex.url) !== null;
  }

  isValidUid(uid = '') {
    return uid.match(this.regex.uid) !== null;
  }
  isValidUsername(username) {
    return username.match(this.regex.username) !== null;
  }
  isValidPassword(password) {
    return password.match(this.regex.password) !== null;
  }
  isValidName(name) {
    return name.match(this.regex.name) !== null;
  }
  isValidZip(zip = '') {
    return zip.match(this.regex.zip) !== null;
  }
}

export default new ValidatorUtils();
