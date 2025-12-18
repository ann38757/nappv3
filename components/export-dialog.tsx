"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { FoodItem } from "@/types/nutrition"
import type { NutritionData } from "@/types/nutrition"
import { Download } from 'lucide-react'

interface ExportDialogProps {
  intakeRecords: { foodId: string; units: number }[]
  foodDatabase: FoodItem[]
  nutritionHalfEat: NutritionData
}

export default function ExportDialog({ intakeRecords, foodDatabase, nutritionHalfEat }: ExportDialogProps) {
  const selectedFoods = intakeRecords.map((record) => {
    const food = foodDatabase.find((f) => f.id === record.foodId)
    return food ? { ...food, units: record.units } : null
  }).filter(Boolean) as (FoodItem & { units: number })[]

  // 生成匯出文本
  const generateExportText = () => {
    let text = "=== 食物攝取報告 ===\n\n"
    text += "已選定食物:\n"
    text += "-".repeat(50) + "\n"

    selectedFoods.forEach((food) => {
      text += `${food.name} × ${food.units}\n`
      text += `  蛋白質: ${(food.protein * food.units).toFixed(2)}g\n`
      text += `  碳水化合物: ${(food.carbs * food.units).toFixed(2)}g\n`
      text += `  脂肪: ${(food.fat * food.units).toFixed(2)}g\n\n`
    })

    text += "=".repeat(50) + "\n"
    text += "營養總計:\n"
    text += "-".repeat(50) + "\n"
    text += `蛋白質: ${nutritionHalfEat.protein.toFixed(2)}g\n`
    text += `碳水化合物: ${nutritionHalfEat.carbon.toFixed(2)}g\n`
    text += `脂肪: ${nutritionHalfEat.fat.toFixed(2)}g\n`
    text += `總熱量: ${Math.round(nutritionHalfEat.protein * 4 + nutritionHalfEat.carbon * 4 + nutritionHalfEat.fat * 9)}kcal\n`

    return text
  }

  // 複製到剪貼板
  const copyToClipboard = () => {
    const text = generateExportText()
    navigator.clipboard.writeText(text).then(() => {
      alert("已複製到剪貼板！")
    })
  }

  // 下載為文本文件
  const downloadAsFile = () => {
    const text = generateExportText()
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
    element.setAttribute("download", `食物攝取報告_${new Date().toISOString().split('T')[0]}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const hasIntakeRecords = intakeRecords.length > 0

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!hasIntakeRecords}>
          <Download className="w-4 h-4 mr-2" />
          匯出
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>匯出食物攝取報告</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 食物列表 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">已選定食物</h3>
            <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto">
              {selectedFoods.length === 0 ? (
                <p className="text-muted-foreground text-sm">暫無選定的食物</p>
              ) : (
                <div className="space-y-2">
                  {selectedFoods.map((food) => (
                    <div key={food.id} className="text-sm border-b pb-2 last:border-0">
                      <div className="font-medium">{food.name} × {food.units}</div>
                      <div className="text-xs text-muted-foreground">
                        P: {(food.protein * food.units).toFixed(2)}g | C: {(food.carbs * food.units).toFixed(2)}g | F: {(food.fat * food.units).toFixed(2)}g
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 營養總計 */}
          <div>
            <h3 className="font-semibold text-lg mb-2">營養總計</h3>
            <div className="bg-muted p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">蛋白質</div>
                  <div className="text-2xl font-bold">{nutritionHalfEat.protein.toFixed(1)}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">碳水化合物</div>
                  <div className="text-2xl font-bold">{nutritionHalfEat.carbon.toFixed(1)}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">脂肪</div>
                  <div className="text-2xl font-bold">{nutritionHalfEat.fat.toFixed(1)}g</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">總熱量</div>
                  <div className="text-2xl font-bold">{Math.round(nutritionHalfEat.protein * 4 + nutritionHalfEat.carbon * 4 + nutritionHalfEat.fat * 9)}kcal</div>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex gap-2 pt-4">
            <Button onClick={copyToClipboard} className="flex-1">
              複製到剪貼板
            </Button>
            <Button onClick={downloadAsFile} variant="outline" className="flex-1">
              下載為文件
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
