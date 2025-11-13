type Subscriber = (count: number) => void;

class LoadingService {
  private count = 0;
  private subs: Set<Subscriber> = new Set();

  show() {
    this.count += 1;
    this.emit();
  }

  hide() {
    this.count = Math.max(0, this.count - 1);
    this.emit();
  }

  reset() {
    this.count = 0;
    this.emit();
  }

  subscribe(cb: Subscriber) {
    this.subs.add(cb);
    // call immediately with current count
    cb(this.count);
    return () => this.subs.delete(cb);
  }

  private emit() {
    for (const cb of this.subs) cb(this.count);
  }
}

const loadingService = new LoadingService();

export default loadingService;
