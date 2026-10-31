import { Observable, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";


export class DebounceHandler {

  private options: DebounceOptions;

  output: Subject<string>;

  constructor(options: DebounceOptions) {
    this.options = options;
    this.output = new Subject();
  }

  setContent(value: string = ''): void {
    this.output.next(value);
  }

  getContent(): Observable<string> {
    return this.output.pipe(debounceTime(this.options.delay));
  }

}

export interface DebounceOptions {
  delay: number;
}

export class SimpleDebounce {
  private debounceTimeout: any;

  async subscribe(millis: number = 300, callback: () => void): Promise<void> {
    clearTimeout(this.debounceTimeout);

    this.debounceTimeout = setTimeout(callback, millis);
  }

}
