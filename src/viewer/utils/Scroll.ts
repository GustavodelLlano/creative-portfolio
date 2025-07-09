import { EventEmitter } from "./EventEmitter";

export class Scroll extends EventEmitter {
  y;
  constructor() {
    super();
    this.y = window.scrollY;

    window.addEventListener("scroll", () => {
      this.trigger("scroll");
    });
  }

  update() {
    this.y = window.scrollY;
  }
}
