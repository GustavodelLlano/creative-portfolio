type Callback = (...args: unknown[]) => void;

interface EventMap {
  [event: string]: Callback[];
}

interface Callbacks {
  [namespace: string]: EventMap;
}

interface ResolvedName {
  original: string;
  value: string;
  namespace: string;
}

export class EventEmitter {
  private callbacks: Callbacks;

  constructor() {
    this.callbacks = {};
    this.callbacks.base = {};
  }

  on(_names: string, callback: Callback): this | boolean {
    // Errors
    if (typeof _names === "undefined" || _names === "") {
      console.warn("wrong names");
      return false;
    }

    if (typeof callback === "undefined") {
      console.warn("wrong callback");
      return false;
    }

    // Resolve names
    const names = this.resolveNames(_names);

    // Each name
    names.forEach((_name) => {
      // Resolve name
      const name = this.resolveName(_name);

      // Create namespace if not exist
      if (!this.callbacks[name.namespace]) {
        this.callbacks[name.namespace] = {};
      }

      // Create callback array if not exist
      if (!this.callbacks[name.namespace][name.value]) {
        this.callbacks[name.namespace][name.value] = [];
      }

      // Add callback
      this.callbacks[name.namespace][name.value].push(callback);
    });

    return this;
  }

  off(_names: string): this | boolean {
    // Errors
    if (typeof _names === "undefined" || _names === "") {
      console.warn("wrong name");
      return false;
    }

    // Resolve names
    const names = this.resolveNames(_names);

    // Each name
    names.forEach((_name) => {
      // Resolve name
      const name = this.resolveName(_name);

      // Remove namespace
      if (name.namespace !== "base" && name.value === "") {
        delete this.callbacks[name.namespace];
      }
      // Remove specific callback in namespace
      else {
        // Default
        if (name.namespace === "base") {
          // Try to remove from each namespace
          for (const namespace in this.callbacks) {
            const eventMap = this.callbacks[namespace];
            if (eventMap && eventMap[name.value]) {
              delete eventMap[name.value];

              // Remove namespace if empty
              if (Object.keys(eventMap).length === 0) {
                delete this.callbacks[namespace];
              }
            }
          }
        }
        // Specified namespace
        else {
          const eventMap = this.callbacks[name.namespace];
          if (eventMap && eventMap[name.value]) {
            delete eventMap[name.value];

            // Remove namespace if empty
            if (Object.keys(eventMap).length === 0) {
              delete this.callbacks[name.namespace];
            }
          }
        }
      }
    });

    return this;
  }

  trigger(_name: string, _args?: unknown[]): unknown {
    // Errors
    if (typeof _name === "undefined" || _name === "") {
      console.warn("wrong name");
      return false;
    }

    let finalResult: unknown = undefined;
    let result: unknown = undefined;

    // Default args
    const args = !(_args instanceof Array) ? [] : _args;

    // Resolve names (should only have one event)
    const names = this.resolveNames(_name);
    if (names.length === 0) {
      console.warn("wrong name");
      return false;
    }

    // Resolve name
    const name = this.resolveName(names[0]);

    // Default namespace
    if (name.namespace === "base") {
      // Try to find callback in each namespace
      for (const namespace in this.callbacks) {
        const eventMap = this.callbacks[namespace];
        if (eventMap && eventMap[name.value]) {
          eventMap[name.value].forEach((callback) => {
            result = callback.apply(this, args);

            if (typeof finalResult === "undefined") {
              finalResult = result;
            }
          });
        }
      }
    }
    // Specified namespace
    else {
      const eventMap = this.callbacks[name.namespace];
      if (eventMap) {
        if (name.value === "") {
          console.warn("wrong name");
          return this;
        }

        if (eventMap[name.value]) {
          eventMap[name.value].forEach((callback) => {
            result = callback.apply(this, args);

            if (typeof finalResult === "undefined") {
              finalResult = result;
            }
          });
        }
      }
    }

    return finalResult;
  }

  private resolveNames(_names: string): string[] {
    let names = _names;
    names = names.replace(/[^a-zA-Z0-9 ,/.]/g, "");
    names = names.replace(/[,/]+/g, " ");
    const nameArray = names
      .split(" ")
      .filter((name) => name && name.length > 0);

    return nameArray;
  }

  private resolveName(name: string): ResolvedName {
    const newName: ResolvedName = {
      original: name,
      value: "",
      namespace: "base",
    };
    const parts = name.split(".");

    newName.value = parts[0];

    // Specified namespace
    if (parts.length > 1 && parts[1] !== "") {
      newName.namespace = parts[1];
    }

    return newName;
  }
}
