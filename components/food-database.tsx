"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Trash2, Edit, Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { FoodItem } from "@/types/nutrition"

interface FoodDatabaseProps {
  foodDatabase: FoodItem[]
  onAddFood: (food: Omit<FoodItem, "id">) => void
  onDeleteFood: (id: string) => void
  onUpdateFood: (food: FoodItem) => void
}

export default function FoodDatabase({ foodDatabase, onAddFood, onDeleteFood, onUpdateFood }: FoodDatabaseProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [protein, setProtein] = useState("")
  const [carbon, setCarbon] = useState("")
  const [fat, setFat] = useState("")
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [foodToDelete, setFoodToDelete] = useState<string | null>(null)

  // 確保localStorage中的食物資料庫與當前狀態同步
  useEffect(() => {
    const savedFoodDatabase = localStorage.getItem("foodDatabase")
    if (savedFoodDatabase) {
      // 這裡不需要設置狀態，因為父組件已經處理了
      console.log("食物資料庫已從localStorage載入", JSON.parse(savedFoodDatabase).length, "項")
    }
  }, [])

  const handleAddFood = () => {
    if (!name || !protein || !carbon || !fat) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      })
      return
    }

    const newFood = {
      name,
      protein: Number.parseFloat(protein),
      carbs: Number.parseFloat(carbon), // 注意這裡修改為 carbs
      fat: Number.parseFloat(fat),
    }

    onAddFood(newFood)

    // 顯示成功訊息
    toast({
      title: "成功",
      description: `已新增食物：${name}`,
    })

    // 重設表單
    setName("")
    setProtein("")
    setCarbon("")
    setFat("")
    setIsAdding(false)

    // 確保數據被保存到localStorage
    setTimeout(() => {
      const savedFoodDatabase = localStorage.getItem("foodDatabase")
      if (savedFoodDatabase) {
        console.log("食物資料庫已更新並保存到localStorage", JSON.parse(savedFoodDatabase).length, "項")
      }
    }, 100)
  }

  // 開始編輯食物
  const startEditFood = (food: FoodItem) => {
    setEditingFood(food)
    setName(food.name)
    setProtein(food.protein.toString())
    // 修正這裡，使用 carbs 屬性
    setCarbon(food.carbs.toString())
    setFat(food.fat.toString())
    setIsEditing(true)
    setIsAdding(false)
  }

  // 更新食物
  const handleUpdateFood = () => {
    if (!editingFood || !name || !protein || !carbon || !fat) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      })
      return
    }

    const updatedFood: FoodItem = {
      id: editingFood.id,
      name,
      protein: Number.parseFloat(protein),
      carbs: Number.parseFloat(carbon), // 修改為 carbs
      fat: Number.parseFloat(fat),
    }

    onUpdateFood(updatedFood)

    // 顯示成功訊息
    toast({
      title: "成功",
      description: `已更新食物：${name}`,
    })

    // 重設表單
    setName("")
    setProtein("")
    setCarbon("")
    setFat("")
    setIsEditing(false)
    setEditingFood(null)
  }

  // 取消編輯或新增
  const handleCancel = () => {
    setName("")
    setProtein("")
    setCarbon("")
    setFat("")
    setIsAdding(false)
    setIsEditing(false)
    setEditingFood(null)
  }

  // 確認刪除食物
  const confirmDeleteFood = (id: string) => {
    setFoodToDelete(id)
    setDeleteConfirmOpen(true)
  }

  // 執行刪除食物
  const handleDeleteFood = () => {
    if (foodToDelete) {
      onDeleteFood(foodToDelete)

      // 顯示成功訊息
      const foodName = foodDatabase.find((f) => f.id === foodToDelete)?.name || "食物"
      toast({
        title: "成功",
        description: `已刪除食物：${foodName}`,
      })

      setFoodToDelete(null)
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>食物資料庫 ({foodDatabase.length}項)</CardTitle>
            {!isAdding && !isEditing && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="mr-2 h-4 w-4" />
                新增食物
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isAdding || isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="food-name">食物名稱</Label>
                <Input
                  id="food-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：雞胸肉"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="food-protein">蛋白質 (g/單位)</Label>
                  <Input
                    id="food-protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food-carbon">碳水化合物 (g/單位)</Label>
                  <Input
                    id="food-carbon"
                    type="number"
                    min="0"
                    step="0.1"
                    value={carbon}
                    onChange={(e) => setCarbon(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="food-fat">脂肪 (g/單位)</Label>
                  <Input
                    id="food-fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  取消
                </Button>
                {isAdding ? (
                  <Button onClick={handleAddFood}>新增</Button>
                ) : (
                  <Button onClick={handleUpdateFood}>更新</Button>
                )}
              </div>
            </div>
          ) : (
            <div>
              {foodDatabase.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">尚未新增任何食物。點擊「新增食物」按鈕來添加。</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>食物名稱</TableHead>
                      <TableHead>蛋白質 (g/單位)</TableHead>
                      <TableHead>碳水化合物 (g/單位)</TableHead>
                      <TableHead>脂肪 (g/單位)</TableHead>
                      <TableHead>熱量 (kcal)</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foodDatabase.map((food) => (
                      <TableRow key={food.id}>
                        <TableCell className="font-medium">{food.name}</TableCell>
                        <TableCell>{food.protein}</TableCell>
                        <TableCell>{food.carbs}</TableCell>
                        <TableCell>{food.fat}</TableCell>
                        <TableCell>{Math.round(food.protein * 4 + food.carbs * 4 + food.fat * 9)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => startEditFood(food)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">編輯</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => confirmDeleteFood(food.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">刪除</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              您確定要刪除這個食物嗎？此操作無法撤銷，且可能會影響已使用此食物的攝取記錄。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFood} className="bg-destructive text-destructive-foreground">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
