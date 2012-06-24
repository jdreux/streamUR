// Define stream type heirarchy
// currently not much
//
module.exports = {
  all: {
    name: "all",
    applies: function(type) {
      return true;
    }
  },
  js: {
    name: "js",
    applies: function(type) {
      return type === this.name;
    }
  },
  twitter: {
    name: "twitter",
    applies: function(type) {
      return type === this.name;
    }
  }
}
