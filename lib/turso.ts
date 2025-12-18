import { createClient } from '@libsql/client/web';

export const turso = createClient({
  url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL!,
  authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN!,
});

export async function initDatabase() {
  await turso.execute(`
    CREATE TABLE IF NOT EXISTS food_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL
    )
  `);
}

export async function getAllFoods() {
  const result = await turso.execute('SELECT * FROM food_database');
  return result.rows;
}

export async function addFood(food: { id: string; name: string; protein: number; carbs: number; fat: number }) {
  await turso.execute({
    sql: 'INSERT INTO food_database (id, name, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)',
    args: [food.id, food.name, food.protein, food.carbs, food.fat],
  });
}

export async function updateFood(food: { id: string; name: string; protein: number; carbs: number; fat: number }) {
  await turso.execute({
    sql: 'UPDATE food_database SET name = ?, protein = ?, carbs = ?, fat = ? WHERE id = ?',
    args: [food.name, food.protein, food.carbs, food.fat, food.id],
  });
}

export async function deleteFood(id: string) {
  await turso.execute({
    sql: 'DELETE FROM food_database WHERE id = ?',
    args: [id],
  });
}

