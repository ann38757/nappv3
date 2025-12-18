"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { NutritionData } from "@/types/nutrition"

interface NutritionGoalsProps {
  nutritionNeeded: NutritionData
  onUpdateNeeded: (needed: NutritionData) => void
}

export default function NutritionGoals({ nutritionNeeded, onUpdateNeeded }: NutritionGoalsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [protein, setProtein] = useState(nutritionNeeded.protein.toString())
  const [carbon, setCarbon] = useState(nutritionNeeded.carbon.toString())
  const [fat, setFat] = useState(nutritionNeeded.fat.toString())

  const handleSave = () => {
    onUpdateNeeded({
      protein: Number.parseFloat(protein) || 0,
      carbon: Number.parseFloat(carbon) || 0,
      fat: Number.parseFloat(fat) || 0,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProtein(nutritionNeeded.protein.toString())
    setCarbon(nutritionNeeded.carbon.toString())
    setFat(nutritionNeeded.fat.toString())
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>營養目標 (Needed)</CardTitle>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              編輯
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="protein">蛋白質 (Protein) g</Label>
              <Input id="protein" type="number" min="0" value={protein} onChange={(e) => setProtein(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbon">碳水化合物 (Carbon) g</Label>
              <Input id="carbon" type="number" min="0" value={carbon} onChange={(e) => setCarbon(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">脂肪 (Fat) g</Label>
              <Input id="fat" type="number" min="0" value={fat} onChange={(e) => setFat(e.target.value)} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                取消
              </Button>
              <Button onClick={handleSave}>儲存</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>蛋白質 (Protein):</span>
              <span>{nutritionNeeded.protein}g</span>
            </div>
            <div className="flex justify-between">
              <span>碳水化合物 (Carbon):</span>
              <span>{nutritionNeeded.carbon}g</span>
            </div>
            <div className="flex justify-between">
              <span>脂肪 (Fat):</span>
              <span>{nutritionNeeded.fat}g</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
