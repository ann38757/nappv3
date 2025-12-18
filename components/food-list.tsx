"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil, Trash2, Check, X } from "lucide-react"
import type { FoodItem } from "@/types/nutrition"

interface FoodListProps {
  foods: FoodItem[]
  onUpdateFood: (food: FoodItem) => void
  onDeleteFood: (id: string) => void
}

export default function FoodList({ foods, onUpdateFood, onDeleteFood }: FoodListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedFood, setEditedFood] = useState<FoodItem | null>(null)

  // 開始編輯
  const startEditing = (food: FoodItem) => {
    setEditingId(food.id)
    setEditedFood({ ...food })
  }

  // 取消編輯
  const cancelEditing = () => {
    setEditingId(null)
    setEditedFood(null)
  }

  // 儲存編輯
  const saveEditing = () => {
    if (editedFood) {
      onUpdateFood(editedFood)
      setEditingId(null)
      setEditedFood(null)
    }
  }

  // 更新編輯中的食物
  const updateEditedFood = (field: keyof FoodItem, value: string) => {
    if (editedFood) {
      if (field === "name") {
        setEditedFood({ ...editedFood, [field]: value })
      } else {
        setEditedFood({ ...editedFood, [field]: Number.parseFloat(value) || 0 })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>食物列表</CardTitle>
      </CardHeader>
      <CardContent>
        {foods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            尚未新增任何食物。請點擊「新增食物」標籤來添加食物項目。
          </div>
        ) : (
          <div className="space-y-4">
            {foods.map((food) => (
              <div key={food.id} className="border rounded-lg p-4">
                {editingId === food.id ? (
                  // 編輯模式
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">食物名稱</label>
                      <Input
                        value={editedFood?.name || ""}
                        onChange={(e) => updateEditedFood("name", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">蛋白質 (g)</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={editedFood?.protein || ""}
                          onChange={(e) => updateEditedFood("protein", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">碳水化合物 (g)</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={editedFood?.carbs || ""}
                          onChange={(e) => updateEditedFood("carbs", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">脂肪 (g)</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={editedFood?.fat || ""}
                          onChange={(e) => updateEditedFood("fat", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">數量/份量</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={editedFood?.quantity || ""}
                          onChange={(e) => updateEditedFood("quantity", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        <X className="h-4 w-4 mr-1" /> 取消
                      </Button>
                      <Button size="sm" onClick={saveEditing}>
                        <Check className="h-4 w-4 mr-1" /> 儲存
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 顯示模式
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{food.name}</h3>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => startEditing(food)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">編輯</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => onDeleteFood(food.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">刪除</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>蛋白質: {food.protein.toFixed(1)} g</div>
                      <div>碳水化合物: {food.carbs.toFixed(1)} g</div>
                      <div>脂肪: {food.fat.toFixed(1)} g</div>
                      <div>數量: {food.quantity}</div>
                      <div className="col-span-2">
                        熱量: {((food.protein * 4 + food.carbs * 4 + food.fat * 9) * food.quantity).toFixed(1)} kcal
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
