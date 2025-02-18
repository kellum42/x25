export const x25log = {
  level: "DEBUG",
  d(msg: string, ...args: (string | number)[]) {
    if ("DEBUG" === this.level) { console.log(`[DEBUG]:${msg}`, ...args); }
  },
  i(msg: string, ...args: (string | number)[]) {
    if (["INFO", "DEBUG"].includes(this.level)) { console.log(`[INFO]:${msg}`, ...args); }
  },
  w(msg: string, ...args: (string | number)[]) {
    if (["WARNING", "INFO", "DEBUG"].includes(this.level)) { console.log(`[WARN]:${msg}`, ...args); }
  },
  e(msg: string, ...args: (string | number)[]) {
    console.log(`[ERROR]:${msg}`, ...args);
  },
}