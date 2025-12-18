"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { FoodItem } from "@/types/nutrition"

interface FoodFormProps {
  onAddFood: (food: FoodItem) => void
}

export default function FoodForm({ onAddFood }: FoodFormProps) {
  const [name, setName] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [quantity, setQuantity] = useState("1")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 驗證輸入
    if (!name || !protein || !carbs || !fat || !quantity) {
      return
    }

    // 建立新食物項目
    const newFood: FoodItem = {
      id: "",
      name,
      protein: Number.parseFloat(protein),
      carbs: Number.parseFloat(carbs),
      fat: Number.parseFloat(fat),
      quantity: Number.parseFloat(quantity),
    }

    // 新增食物
    onAddFood(newFood)

    // 重設表單
    setName("")
    setProtein("")
    setCarbs("")
    setFat("")
    setQuantity("1")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新增食物</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">食物名稱</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：雞胸肉"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protein">蛋白質 (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                min="0"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">碳水化合物 (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                min="0"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fat">脂肪 (g)</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                min="0"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">數量/份量</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            新增食物
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
