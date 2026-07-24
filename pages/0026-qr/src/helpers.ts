/**
 * Подбирает ближайший к `proposedSize` размер (в px), при котором каждая ячейка
 * QR-матрицы укладывается в целое число пикселей — модули рисуются чётко,
 * без размытия на границах.
 */
export function nearestSizeToPerfectFitCells(
  proposedSize: number,
  cellsCount: number,
) {
  const lowerBound = Math.floor(proposedSize / cellsCount) * cellsCount;
  const upperBound = Math.ceil(proposedSize / cellsCount) * cellsCount;

  if (
    Math.abs(proposedSize - lowerBound) <= Math.abs(proposedSize - upperBound)
  ) {
    return lowerBound;
  }
  return upperBound;
}
