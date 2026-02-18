export const formatTimestamp = (timestamp: Date | string): string => {
  return new Date(timestamp).toLocaleTimeString()
}
