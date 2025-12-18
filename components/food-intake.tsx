"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { FoodItem } from "@/types/nutrition"
import ExportDialog from "./export-dialog"
import type { NutritionData } from "@/types/nutrition"

interface FoodIntakeProps {
  foodDatabase: FoodItem[]
  intakeRecords: { foodId: string; units: number }[]
  onUpdateIntake: (records: { foodId: string; units: number }[]) => void
}

export default function FoodIntake({ foodDatabase, intakeRecords, onUpdateIntake }: FoodIntakeProps) {
  const [nutritionHalfEat, setNutritionHalfEat] = useState<NutritionData>({
    protein: 0,
    carbon: 0,
    fat: 0,
  })

  // 暫存的攝取記錄
  const [tempIntake, setTempIntake] = useState<{ [key: string]: { checked: boolean; units: number } }>({})

  // 初始化暫存記錄
  useEffect(() => {
    const initialTempIntake: { [key: string]: { checked: boolean; units: number } } = {}

    foodDatabase.forEach((food) => {
      const existingRecord = intakeRecords.find((record) => record.foodId === food.id)
      initialTempIntake[food.id] = {
        checked: !!existingRecord,
        units: existingRecord?.units || 1,
      }
    })

    setTempIntake(initialTempIntake)

    const totalNutrition = intakeRecords.reduce(
      (acc, record) => {
        const food = foodDatabase.find((f) => f.id === record.foodId)
        if (!food) return acc

        return {
          protein: acc.protein + food.protein * record.units,
          carbon: acc.carbon + food.carbs * record.units,
          fat: acc.fat + food.fat * record.units,
        }
      },
      { protein: 0, carbon: 0, fat: 0 },
    )

    setNutritionHalfEat(totalNutrition)
  }, [foodDatabase, intakeRecords])

  // 更新暫存記錄
  const updateTempIntake = (foodId: string, field: "checked" | "units", value: boolean | number) => {
    setTempIntake((prev) => ({
      ...prev,
      [foodId]: {
        ...prev[foodId],
        [field]: value,
      },
    }))
  }

  // 儲存攝取記錄
  const saveIntakeRecords = () => {
    const newRecords = Object.entries(tempIntake)
      .filter(([_, data]) => data.checked)
      .map(([foodId, data]) => ({
        foodId,
        units: data.units,
      }))

    onUpdateIntake(newRecords)
  }

  // 清除所有攝取記錄
  const clearIntakeRecords = () => {
    const clearedTempIntake: { [key: string]: { checked: boolean; units: number } } = {}

    Object.keys(tempIntake).forEach((foodId) => {
      clearedTempIntake[foodId] = {
        checked: false,
        units: 1,
      }
    })

    setTempIntake(clearedTempIntake)
    onUpdateIntake([])
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>食物攝取記錄</CardTitle>
          <div className="space-x-2">
            <ExportDialog 
              intakeRecords={intakeRecords} 
              foodDatabase={foodDatabase}
              nutritionHalfEat={nutritionHalfEat}
            />
            <Button variant="outline" onClick={clearIntakeRecords}>
              清除記錄
            </Button>
            <Button onClick={saveIntakeRecords}>儲存記錄</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {foodDatabase.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">尚未新增任何食物。請先在「食物資料庫」中添加食物。</p>
        ) : (
          <div className="space-y-4">
            {foodDatabase.map((food) => (
              <div key={food.id} className="flex items-center space-x-4 p-2 border rounded-md">
                <Checkbox
                  id={`food-${food.id}`}
                  checked={tempIntake[food.id]?.checked || false}
                  onCheckedChange={(checked) => updateTempIntake(food.id, "checked", checked === true)}
                />
                <Label htmlFor={`food-${food.id}`} className="flex-grow">
                  {food.name}
                  <span className="text-sm text-muted-foreground ml-2">
                    (P: {food.protein}g, C: {food.carbs}g, F: {food.fat}g, 熱量:{" "}
                    {Math.round(food.protein * 4 + food.carbs * 4 + food.fat * 9)}kcal)
                  </span>
                </Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`units-${food.id}`} className="text-sm">
                    單位:
                  </Label>
                  <Input
                    id={`units-${food.id}`}
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={tempIntake[food.id]?.units || 1}
                    onChange={(e) => updateTempIntake(food.id, "units", Number.parseFloat(e.target.value) || 0)}
                    className="w-20"
                    disabled={!tempIntake[food.id]?.checked}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4">
              <Button onClick={saveIntakeRecords} className="w-full">
                更新攝取記錄
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
