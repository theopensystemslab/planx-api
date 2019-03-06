export function log(...messages: any): void {
  if (process.env.DEBUG) {
    console.log(messages);
  }
}
