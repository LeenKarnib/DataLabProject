const HashMap = require("./HashMap");

class HashSet {
  constructor() {
    this.map = new HashMap();
  }

  add(value) {
    this.map.set(value, true);
  }

  remove(value) {
    this.map.delete(value);
  }

  has(value) {
    return this.map.get(value) === true;
  }

  getAll() {
    return this.map.buckets
      .flat()
      .filter(([_, v]) => v === true)
      .map(([k]) => k);
  }

  clear() {
    this.map = new HashMap();
  }
}

module.exports = HashSet;