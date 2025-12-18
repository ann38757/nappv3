"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NutritionGoals } from "@/types/nutrition"

interface DailyGoalsProps {
  nutritionGoals: NutritionGoals
  onUpdateGoals: (goals: NutritionGoals) => void
}

export default function DailyGoals({ nutritionGoals, onUpdateGoals }: DailyGoalsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [protein, setProtein] = useState(nutritionGoals.protein.toString())
  const [carbs, setCarbs] = useState(nutritionGoals.carbs.toString())
  const [fat, setFat] = useState(nutritionGoals.fat.toString())

  // 開始編輯
  const handleStartEditing = () => {
    setProtein(nutritionGoals.protein.toString())
    setCarbs(nutritionGoals.carbs.toString())
    setFat(nutritionGoals.fat.toString())
    setIsEditing(true)
  }

  // 儲存目標
  const handleSaveGoals = () => {
    onUpdateGoals({
      protein: Number.parseFloat(protein) || 0,
      carbs: Number.parseFloat(carbs) || 0,
      fat: Number.parseFloat(fat) || 0,
    })
    setIsEditing(false)
  }

  // 取消編輯
  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">每日營養目標</h2>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={handleStartEditing}>
            編輯目標
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="protein-goal">蛋白質目標 (g)</Label>
            <Input
              id="protein-goal"
              type="number"
              min="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carbs-goal">碳水化合物目標 (g)</Label>
            <Input id="carbs-goal" type="number" min="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fat-goal">脂肪目標 (g)</Label>
            <Input id="fat-goal" type="number" min="0" value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleSaveGoals}>儲存目標</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>蛋白質:</span>
            <span>{nutritionGoals.protein} g</span>
          </div>
          <div className="flex justify-between">
            <span>碳水化合物:</span>
            <span>{nutritionGoals.carbs} g</span>
          </div>
          <div className="flex justify-between">
            <span>脂肪:</span>
            <span>{nutritionGoals.fat} g</span>
          </div>
          <div className="flex justify-between pt-2">
            <span>總熱量目標:</span>
            <span>
              {(nutritionGoals.protein * 4 + nutritionGoals.carbs * 4 + nutritionGoals.fat * 9).toFixed(1)} kcal
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
