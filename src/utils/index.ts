import { title } from "process"

/**
 * Generate a random username (e.g. user-abc123)
 */
export const genUsername = (): string => {
  const usernamePrefix = 'user-'
  const randomChars = Math.random().toString(36).slice(2)

  const username = usernamePrefix + randomChars

  return username
}

export const genSlug = (title: string): string => {
  // console.log(title)
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]\s-/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
  
  // console.log(slug)
  
    const randomChars = Math.random().toString(36).slice(2)
    const uniqueSlug = `${slug}-${randomChars}`

  // console.log(uniqueSlug)

    return uniqueSlug
}