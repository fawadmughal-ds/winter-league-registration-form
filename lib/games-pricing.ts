// Games pricing based on Winter League 2025 PDF

export interface GamePrice {
  name: string;
  boys: number | null;
  girls: number | null;
  boysPlayers?: number;
  girlsPlayers?: number;
}

export const gamesPricing: GamePrice[] = [
  { name: 'Cricket', boys: 2200, girls: 1200, boysPlayers: 11, girlsPlayers: 5 },
  { name: 'Football', boys: 2200, girls: 1200, boysPlayers: 11, girlsPlayers: 6 },
  { name: 'Double Wicket', boys: 500, girls: null, boysPlayers: 2 },
  { name: 'Badminton Singles', boys: 200, girls: 200 },
  { name: 'Badminton Doubles', boys: 400, girls: 200 },
  { name: 'Table Tennis Singles', boys: 200, girls: null },
  { name: 'Table Tennis Doubles', boys: 400, girls: 400 },
  { name: 'Foosball Doubles', boys: 400, girls: 400 },
  { name: 'Ludo Singles', boys: 150, girls: 150 },
  { name: 'Ludo Doubles', boys: 300, girls: 300 },
  { name: 'Carrom Singles', boys: 150, girls: 150 },
  { name: 'Carrom Doubles', boys: 250, girls: 250 },
  { name: 'Darts Singles', boys: 150, girls: 150 },
  { name: 'Tug of War', boys: 1000, girls: 600, boysPlayers: 10, girlsPlayers: 6 },
  { name: 'Jenga', boys: 150, girls: 150 },
  { name: 'Chess', boys: 150, girls: 150 },
  { name: 'Arm Wrestling', boys: 150, girls: null },
  { name: 'Pitho Gol Garam', boys: 1000, girls: null, boysPlayers: 6 },
  { name: 'Uno', boys: 100, girls: null },
  { name: 'Tekken', boys: 300, girls: 300 },
  { name: 'Fifa', boys: 300, girls: 300 },
];

export function getGamePrice(gameName: string, gender: 'boys' | 'girls'): number | null {
  const game = gamesPricing.find((g) => g.name === gameName);
  if (!game) return null;
  return gender === 'boys' ? game.boys : game.girls;
}

export function getAvailableGames(gender: 'boys' | 'girls'): GamePrice[] {
  return gamesPricing.filter((game) => {
    return gender === 'boys' ? game.boys !== null : game.girls !== null;
  });
}

export function calculateTotal(selectedGames: string[], gender: 'boys' | 'girls'): number {
  let total = 0;
  selectedGames.forEach((gameName) => {
    const price = getGamePrice(gameName, gender);
    if (price !== null) {
      total += price;
    }
  });
  return total;
}

