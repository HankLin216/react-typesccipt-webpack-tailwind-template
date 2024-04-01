declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}

declare module '*.gif' {
  const src: string
  export default src
}
