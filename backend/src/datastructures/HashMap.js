class HashMap {
  constructor(size = 64) {
    this.buckets = new Array(size).fill(null).map(() => []);
    this.size = size;
  }

  _hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash + key.charCodeAt(i) * (i + 1)) % this.size;
    }
    return hash;
  }

  set(key, value) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const existing = bucket.find(([k]) => k === key);
    if (existing) existing[1] = value;
    else bucket.push([key, value]);
  }

  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    const entry = bucket.find(([k]) => k === key);
    return entry ? entry[1] : null;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    const index = this._hash(key);
    this.buckets[index] = this.buckets[index].filter(([k]) => k !== key);
  }

  getAll() {
    return this.buckets.flat().map(([_, v]) => v);
  }

  keys() {
    return this.buckets.flat().map(([k]) => k);
  }
}

module.exports = HashMap;