import type { Viewer } from "../Viewer";
import { EventEmitter } from "./EventEmitter";
import { Sizes } from "./Sizes";

export class Mouse extends EventEmitter {
  private viewer: Viewer;
  private sizes: Sizes;
  cursor = {
    x: 0,
    y: 0,
  };
  parallax = {
    x: 0,
    y: 0,
  };

  constructor(_viewer: Viewer) {
    super();

    this.viewer = _viewer;
    this.sizes = this.viewer.sizes;

    window.addEventListener("mousemove", (event) => {
      this.mousemove(event);
      this.trigger("mousemove");
    });
  }

  private targetParallax = { x: 0, y: 0 };
  private lerpAlpha = 0.1;

  mousemove(event: MouseEvent) {
    this.cursor.x = event.clientX / this.sizes.width - 0.5;
    this.cursor.y = event.clientY / this.sizes.height - 0.5;

    // Clamp values
    this.cursor.x = Math.max(-0.5, Math.min(0.5, this.cursor.x));
    this.cursor.y = Math.max(-0.5, Math.min(0.5, this.cursor.y));

    // Target parallax
    this.targetParallax.x = this.cursor.x / 5;
    this.targetParallax.y = this.cursor.y / 5;

    // Smoothly interpolate
    this.parallax.x +=
      (this.targetParallax.x - this.parallax.x) * this.lerpAlpha;
    this.parallax.y +=
      (this.targetParallax.y - this.parallax.y) * this.lerpAlpha;
  }
}
