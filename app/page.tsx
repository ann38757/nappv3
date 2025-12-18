"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NutritionGoals from "@/components/nutrition-goals"
import FoodDatabase from "@/components/food-database"
import FoodIntake from "@/components/food-intake"
import NutritionRecommendation from "@/components/nutrition-recommendation"
import type { FoodItem, NutritionData } from "@/types/nutrition"
import NutritionSummary from "@/components/nutrition-summary"
import { toast } from "@/hooks/use-toast"
import { turso, initDatabase, getAllFoods, addFood, updateFood, deleteFood } from "@/lib/turso"

export default function Home() {
  const [nutritionNeeded, setNutritionNeeded] = useState<NutritionData>({
    protein: 175,
    carbon: 260,
    fat: 65,
  })

  const [nutritionHalfEat, setNutritionHalfEat] = useState<NutritionData>({
    protein: 0,
    carbon: 0,
    fat: 0,
  })

  const [nutritionWanted, setNutritionWanted] = useState<NutritionData>({
    protein: 120,
    carbon: 250,
    fat: 70,
  })

  const [isLoading, setIsLoading] = useState(true)
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([])
  const [intakeRecords, setIntakeRecords] = useState<{ foodId: string; units: number }[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const savedNeeded = localStorage.getItem("nutritionNeeded")
        const savedHalfEat = localStorage.getItem("nutritionHalfEat")

        let isFirstLoad = false

        if (savedNeeded) {
          const parsedNeeded = JSON.parse(savedNeeded)
          setNutritionNeeded(parsedNeeded)
        } else {
          isFirstLoad = true
          const defaultNeeded = {
            protein: 175,
            carbon: 260,
            fat: 65,
          }
          setNutritionNeeded(defaultNeeded)
          localStorage.setItem("nutritionNeeded", JSON.stringify(defaultNeeded))
        }

        if (savedHalfEat) {
          setNutritionHalfEat(JSON.parse(savedHalfEat))
        }

        // 從 Turso 載入食物資料庫
        try {
          await initDatabase()
          const foods = await getAllFoods()
          
          if (foods && foods.length > 0) {
            const foodItems = foods.map((item: any) => ({
              id: item.id,
              name: item.name,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
            }))
            setFoodDatabase(foodItems)
            console.log(`[Turso] Loaded ${foodItems.length} food items`)
          } else {
            // 如果資料庫是空的，載入預設資料
            const defaultFoods = [
              { id: "1", name: "白米（生）（每100g）", protein: 6.4, carbs: 77.6, fat: 0.2 },
              { id: "2", name: "蒸煮麵（每份）", protein: 5.7, carbs: 51.7, fat: 0.8 },
              { id: "3", name: "玉米罐頭（每罐）", protein: 8, carbs: 60, fat: 4 },
              { id: "4", name: "生雞胸肉（每100g）", protein: 22.4, carbs: 0, fat: 0.9 },
              { id: "5", name: "水煮蛋（每顆）", protein: 6, carbs: 0, fat: 5 },
            ]
            setFoodDatabase(defaultFoods)
            // 儲存預設資料到 Turso
            for (const food of defaultFoods) {
              await addFood(food)
            }
            console.log("[Turso] Initialized with default foods")
          }
        } catch (error) {
          console.error("[Turso] Error:", error)
          // 如果 Turso 失敗，使用 localStorage
          const savedFoodDatabase = localStorage.getItem("foodDatabase")
          if (savedFoodDatabase) {
            setFoodDatabase(JSON.parse(savedFoodDatabase))
          }
        }

        const savedIntakeRecords = localStorage.getItem("intakeRecords")
        if (savedIntakeRecords) {
          setIntakeRecords(JSON.parse(savedIntakeRecords))
        }

        if (isFirstLoad) {
          toast({
            title: "歡迎使用",
            description: "已設定預設營養目標：蛋白質 175g, 碳水化合物 260g, 脂肪 65g",
          })
        } else {
          toast({
            title: "資料載入成功",
            description: "已載入您保存的營養目標和食物資料",
          })
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "載入資料失敗",
          description: "無法載入資料，將使用預設值",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 儲存資料到 localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("nutritionNeeded", JSON.stringify(nutritionNeeded))
        localStorage.setItem("nutritionHalfEat", JSON.stringify(nutritionHalfEat))
        localStorage.setItem("intakeRecords", JSON.stringify(intakeRecords))
      } catch (error) {
        console.error("儲存資料時發生錯誤:", error)
      }
    }
  }, [nutritionNeeded, nutritionHalfEat, intakeRecords, isLoading])

  // 計算待攝取營養 (Wanted)
  useEffect(() => {
    setNutritionWanted({
      protein: Math.max(0, nutritionNeeded.protein - nutritionHalfEat.protein),
      carbon: Math.max(0, nutritionNeeded.carbon - nutritionHalfEat.carbon),
      fat: Math.max(0, nutritionNeeded.fat - nutritionHalfEat.fat),
    })
  }, [nutritionNeeded, nutritionHalfEat])

  // 更新營養目標
  const updateNutritionNeeded = (newNeeded: NutritionData) => {
    setNutritionNeeded(newNeeded)
    toast({
      title: "營養目標已更新",
      description: "您的營養目標已成功更新並保存",
    })
  }

  const addFoodToDatabase = async (food: Omit<FoodItem, "id">) => {
    const newFood = {
      ...food,
      id: Date.now().toString(),
    }
    const updatedDatabase = [...foodDatabase, newFood]
    setFoodDatabase(updatedDatabase)

    try {
      await addFood(newFood)
      toast({
        title: "成功",
        description: `已新增食物：${newFood.name}`,
      })
    } catch (error) {
      console.error("[Turso] Error adding food:", error)
      toast({
        title: "警告",
        description: "食物已添加到本地，但保存到雲端失敗",
        variant: "destructive",
      })
    }
  }

  const deleteFoodFromDatabase = async (id: string) => {
    const hasIntakeRecords = intakeRecords.some((record) => record.foodId === id)
    const updatedDatabase = foodDatabase.filter((food) => food.id !== id)
    setFoodDatabase(updatedDatabase)

    try {
      await deleteFood(id)
    } catch (error) {
      console.error("[Turso] Error deleting food:", error)
    }

    if (hasIntakeRecords) {
      const updatedRecords = intakeRecords.filter((record) => record.foodId !== id)
      setIntakeRecords(updatedRecords)

      const totalNutrition = updatedRecords.reduce(
        (acc, record) => {
          const food = updatedDatabase.find((f) => f.id === record.foodId)
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

      toast({
        title: "攝取記錄已更新",
        description: "由於刪除了食物，相關的攝取記錄也已被移除",
      })
    }
  }

  const updateFoodInDatabase = async (updatedFoodItem: FoodItem) => {
    const updatedDatabase = foodDatabase.map((food) => (food.id === updatedFoodItem.id ? updatedFoodItem : food))
    setFoodDatabase(updatedDatabase)

    try {
      await updateFood(updatedFoodItem)
      toast({
        title: "成功",
        description: `已更新食物：${updatedFoodItem.name}`,
      })
    } catch (error) {
      console.error("[Turso] Error updating food:", error)
      toast({
        title: "警告",
        description: "食物已更新到本地，但無法保存到雲端",
        variant: "destructive",
      })
    }

    const hasIntakeRecords = intakeRecords.some((record) => record.foodId === updatedFoodItem.id)
    if (hasIntakeRecords) {
      const totalNutrition = intakeRecords.reduce(
        (acc, record) => {
          const food = updatedDatabase.find((f) => f.id === record.foodId)
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
    }
  }

  // 更新已攝取食物
  const updateIntakeRecords = (records: { foodId: string; units: number }[]) => {
    setIntakeRecords(records)

    const totalNutrition = records.reduce(
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

    toast({
      title: "食物攝取記錄已更新",
      description: "您的食物攝取記錄已成功更新並保存",
    })
  }

  if (isLoading) {
    return (
      <main className="container mx-auto py-6 px-4">
        <div className="text-center">
          <p>正在加載資料...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">營養計算應用程式</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NutritionGoals nutritionNeeded={nutritionNeeded} onUpdateNeeded={updateNutritionNeeded} />
        <NutritionSummary nutritionNeeded={nutritionNeeded} nutritionHalfEat={nutritionHalfEat} />
      </div>

      <Tabs defaultValue="intake" className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="intake">食物攝取</TabsTrigger>
          <TabsTrigger value="database">食物資料庫</TabsTrigger>
          <TabsTrigger value="recommendation">營養推薦</TabsTrigger>
        </TabsList>

        <TabsContent value="intake" className="mt-4">
          <FoodIntake foodDatabase={foodDatabase} intakeRecords={intakeRecords} onUpdateIntake={updateIntakeRecords} />
        </TabsContent>

        <TabsContent value="database" className="mt-4">
          <FoodDatabase
            foodDatabase={foodDatabase}
            onAddFood={addFoodToDatabase}
            onDeleteFood={deleteFoodFromDatabase}
            onUpdateFood={updateFoodInDatabase}
          />
        </TabsContent>

        <TabsContent value="recommendation" className="mt-4">
          <NutritionRecommendation
            nutritionWanted={nutritionWanted}
            foodDatabase={foodDatabase}
            onUpdateIntake={updateIntakeRecords}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}
