
import { GridCell, DisasterType } from '@/types/pathfinding';

export const applyDisasterEffect = (
  grid: GridCell[][],
  disasterType: DisasterType,
  intensity: number
): GridCell[][] => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
  const size = grid.length;
  
  switch (disasterType) {
    case 'flood':
      return applyFloodEffect(newGrid, intensity, size);
    case 'fire':
      return applyFireEffect(newGrid, intensity, size);
    case 'earthquake':
      return applyEarthquakeEffect(newGrid, intensity, size);
    default:
      return newGrid;
  }
};

const applyFloodEffect = (grid: GridCell[][], intensity: number, size: number): GridCell[][] => {
  // Flood spreads from bottom-left corner
  const floodRadius = Math.floor((intensity / 100) * size * 0.4);
  
  for (let y = size - 1; y >= Math.max(0, size - floodRadius); y--) {
    for (let x = 0; x < Math.min(size, floodRadius + (size - 1 - y)); x++) {
      if (Math.random() < 0.7) {
        grid[y][x].isWall = true;
      }
    }
  }
  
  return grid;
};

const applyFireEffect = (grid: GridCell[][], intensity: number, size: number): GridCell[][] => {
  // Fire creates scattered obstacles with some clustering
  const numFireCells = Math.floor((intensity / 100) * size * size * 0.3);
  const fireCenters = Math.floor(numFireCells / 10);
  
  // Create fire centers
  for (let i = 0; i < fireCenters; i++) {
    const centerX = Math.floor(Math.random() * size);
    const centerY = Math.floor(Math.random() * size);
    const radius = 2 + Math.floor(Math.random() * 3);
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;
        
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius && Math.random() < 0.8 - (distance / radius) * 0.3) {
            grid[y][x].isWall = true;
          }
        }
      }
    }
  }
  
  return grid;
};

const applyEarthquakeEffect = (grid: GridCell[][], intensity: number, size: number): GridCell[][] => {
  // Earthquake creates cracks and random debris
  const numCracks = Math.floor((intensity / 100) * 5);
  
  for (let i = 0; i < numCracks; i++) {
    // Create diagonal cracks
    const startX = Math.floor(Math.random() * size);
    const startY = Math.floor(Math.random() * size);
    const length = Math.floor(size * 0.3 + Math.random() * size * 0.4);
    const direction = Math.random() < 0.5 ? 1 : -1;
    
    for (let j = 0; j < length; j++) {
      const x = startX + j * direction;
      const y = startY + j;
      
      if (x >= 0 && x < size && y >= 0 && y < size) {
        if (Math.random() < 0.6) {
          grid[y][x].isWall = true;
        }
        
        // Add debris around cracks
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && Math.random() < 0.2) {
              grid[ny][nx].isWall = true;
            }
          }
        }
      }
    }
  }
  
  return grid;
};
