export interface FoodItem {
  id: string
  name: string
  protein: number
  carbs: number // 改成與其他地方一致的命名
  fat: number
}

export interface NutritionData {
  protein: number
  carbon: number // 這個保持不變，因為其他組件依賴此名稱
  fat: number
}

export interface NutritionGoals {
  protein: number
  carbs: number
  fat: number
}
