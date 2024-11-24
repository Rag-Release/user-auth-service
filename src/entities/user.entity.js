class User {
  constructor({ id, email, password, role, createdAt }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || "reader"; // Default role
    this.createdAt = createdAt || new Date();
  }

  validate() {
    if (!this.email || !this.email.includes("@")) {
      throw new Error("Invalid email format");
    }
    if (!this.password || this.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    return true;
  }
}

module.exports = User;
