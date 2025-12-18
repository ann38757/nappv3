"use client"

import { Edit, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { FoodItemType } from "@/types/food"

interface FoodItemProps {
  food: FoodItemType
  onEdit: () => void
  onDelete: () => void
}

export default function FoodItem({ food, onEdit, onDelete }: FoodItemProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">{food.name}</h3>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">熱量:</span>
            <span className="font-medium">{food.calories} kcal</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">蛋白質:</span>
            <span className="font-medium">{food.protein.toFixed(1)} g</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">脂肪:</span>
            <span className="font-medium">{food.fat.toFixed(1)} g</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">碳水化合物:</span>
            <span className="font-medium">{food.carbs.toFixed(1)} g</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 bg-muted/20 p-4">
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Edit size={16} />
          <span className="sr-only">編輯</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onDelete} className="text-destructive">
          <Trash2 size={16} />
          <span className="sr-only">刪除</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
