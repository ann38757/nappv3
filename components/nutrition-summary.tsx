// 新增營養摘要組件，顯示熱量和營養素攝取情況
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { NutritionData } from "@/types/nutrition"

interface NutritionSummaryProps {
  nutritionNeeded: NutritionData
  nutritionHalfEat: NutritionData
}

export default function NutritionSummary({ nutritionNeeded, nutritionHalfEat }: NutritionSummaryProps) {
  // 計算進度百分比
  const proteinPercentage =
    nutritionNeeded.protein > 0 ? Math.min(100, (nutritionHalfEat.protein / nutritionNeeded.protein) * 100) : 0

  const carbonPercentage =
    nutritionNeeded.carbon > 0 ? Math.min(100, (nutritionHalfEat.carbon / nutritionNeeded.carbon) * 100) : 0

  const fatPercentage = nutritionNeeded.fat > 0 ? Math.min(100, (nutritionHalfEat.fat / nutritionNeeded.fat) * 100) : 0

  // 計算熱量
  const caloriesNeeded = nutritionNeeded.protein * 4 + nutritionNeeded.carbon * 4 + nutritionNeeded.fat * 9
  const caloriesHalfEat = nutritionHalfEat.protein * 4 + nutritionHalfEat.carbon * 4 + nutritionHalfEat.fat * 9
  const caloriesPercentage = caloriesNeeded > 0 ? Math.min(100, (caloriesHalfEat / caloriesNeeded) * 100) : 0

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">營養攝取摘要</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>熱量</span>
              <span>
                {Math.round(caloriesHalfEat)} / {Math.round(caloriesNeeded)} kcal
              </span>
            </div>
            <Progress value={caloriesPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>蛋白質</span>
              <span>
                {nutritionHalfEat.protein.toFixed(1)} / {nutritionNeeded.protein} g
              </span>
            </div>
            <Progress value={proteinPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>碳水化合物</span>
              <span>
                {nutritionHalfEat.carbon.toFixed(1)} / {nutritionNeeded.carbon} g
              </span>
            </div>
            <Progress value={carbonPercentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>脂肪</span>
              <span>
                {nutritionHalfEat.fat.toFixed(1)} / {nutritionNeeded.fat} g
              </span>
            </div>
            <Progress value={fatPercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
