let applicationId = 0
let zIndex = 0
export const applications = {}

export const getAppId = () => {
  return applicationId++
}

export const getMaxId = () => {
  return applicationId
}

export const getZIndex = () => {
  return zIndex++
}
