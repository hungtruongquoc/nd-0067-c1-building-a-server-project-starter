export function getFileNameWithSize(originalFileName: string, width: number, height: number): string {
  const name = originalFileName.split(".")[0];
  const extension = originalFileName.split(".")[1];
  return `${name}_${width}_${height}.${extension}`
}
