class AuthError extends Error {
  constructor(...params) {
    super(...params);
    this.name = "AuthError";
  }
}
