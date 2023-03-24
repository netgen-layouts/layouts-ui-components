export const addTimestampToUrl = (url) => {
  const urlObject = new URL(url)
  let searchParams = new URLSearchParams(urlObject.search)
  searchParams.set('t', Date.now())

  return `${urlObject.origin + urlObject.pathname}?${searchParams.toString()}`
}