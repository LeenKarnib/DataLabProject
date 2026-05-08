class PriorityQueue {
  constructor() {
    this.heap = [];
    this.priorityMap = {
      Critical: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };
  }

  compare(a, b) {
    const priorityA = this.priorityMap[a.priority] || 0;
    const priorityB = this.priorityMap[b.priority] || 0;

    if (priorityA !== priorityB) {
      return priorityA > priorityB;
    }

    return new Date(a.deadline) < new Date(b.deadline);
  }

  enqueue(item) {
    this.heap.push(item);
    this.heapifyUp();
  }

  dequeue() {
    if (this.isEmpty()) return null;

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const highestPriorityItem = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown();

    return highestPriorityItem;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  toArray() {
    return [...this.heap].sort((a, b) => {
      if (this.compare(a, b)) return -1;
      if (this.compare(b, a)) return 1;
      return 0;
    });
  }

  heapifyUp() {
    let index = this.heap.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.compare(this.heap[index], this.heap[parentIndex])) {
        [this.heap[index], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[index],
        ];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  heapifyDown() {
    let index = 0;

    while (true) {
      let highest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.compare(this.heap[leftChild], this.heap[highest])
      ) {
        highest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.compare(this.heap[rightChild], this.heap[highest])
      ) {
        highest = rightChild;
      }

      if (highest !== index) {
        [this.heap[index], this.heap[highest]] = [
          this.heap[highest],
          this.heap[index],
        ];
        index = highest;
      } else {
        break;
      }
    }
  }
}

export default PriorityQueue;