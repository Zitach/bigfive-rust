export function getQuestionsPerPage(windowWidth: number): number {
  if (windowWidth < 640) {
    return 1
  } else if (windowWidth < 1024) {
    return 3
  } else if (windowWidth < 1440) {
    return 5
  } else {
    return 7
  }
}
