export function log(...messages: any): void {
  if (JSON.parse(process.env.DEBUG)) {
    console.log(messages)
  }
}
