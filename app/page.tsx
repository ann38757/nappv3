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
  const [supabase, setSupabase] = useState<any>(null)

  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([])
  const [intakeRecords, setIntakeRecords] = useState<{ foodId: string; units: number }[]>([])

  useEffect(() => {
    const initSupabase = async () => {
      try {
        if (typeof window !== "undefined") {
          const { createClient } = await import("@/lib/supabase/client")
          const client = createClient()
          setSupabase(client)
          console.log("[v0] Supabase client initialized successfully")
        }
      } catch (error) {
        console.warn("[v0] Failed to initialize Supabase client:", error)
        setSupabase(null)
      }
    }

    initSupabase()
  }, [])

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
          console.log("[v0] Loaded saved nutrition goals:", parsedNeeded)
        } else {
          // Only set defaults on first load when no saved data exists
          isFirstLoad = true
          const defaultNeeded = {
            protein: 175,
            carbon: 260,
            fat: 65,
          }
          setNutritionNeeded(defaultNeeded)
          localStorage.setItem("nutritionNeeded", JSON.stringify(defaultNeeded))
          console.log("[v0] Using default nutrition goals (first load)")
        }

        if (savedHalfEat) {
          setNutritionHalfEat(JSON.parse(savedHalfEat))
        }

        let foodDatabaseFromSupabase: FoodItem[] | null = null

        if (supabase) {
          try {
            const { data, error } = await supabase.from("food_database").select("*")

            if (error) {
              console.error("[v0] Error loading food database from Supabase:", error)
              throw error
            }

            if (data && data.length > 0) {
              foodDatabaseFromSupabase = data.map((item: any) => ({
                id: item.id,
                name: item.name,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
              }))

              setFoodDatabase(foodDatabaseFromSupabase)
              console.log(`[v0] Loaded ${foodDatabaseFromSupabase.length} food items from Supabase`)
            }
          } catch (error) {
            console.error("[v0] Error with Supabase, falling back to localStorage:", error)
          }
        }

        // If no data from Supabase, use localStorage or defaults
        if (!foodDatabaseFromSupabase) {
          const savedFoodDatabase = localStorage.getItem("foodDatabase")
          if (savedFoodDatabase) {
            setFoodDatabase(JSON.parse(savedFoodDatabase))
          } else {
            setFoodDatabase([
              { id: "1", name: "白米（生）（每100g）", protein: 6.4, carbs: 77.6, fat: 0.2 },
              { id: "2", name: "蒸煮麵（每份）", protein: 5.7, carbs: 51.7, fat: 0.8 },
              { id: "3", name: "玉米罐頭（每罐）", protein: 8, carbs: 60, fat: 4 },
              { id: "4", name: "生雞胸肉（每100g）", protein: 22.4, carbs: 0, fat: 0.9 },
              { id: "5", name: "水煮蛋（每顆）", protein: 6, carbs: 0, fat: 5 },
              { id: "6", name: "魚罐頭（每罐）", protein: 30, carbs: 0, fat: 10 },
              { id: "7", name: "蝦子（每隻）", protein: 1.9, carbs: 0, fat: 0 },
              { id: "8", name: "滷大黑豆干（每個）", protein: 16.5, carbs: 8.8, fat: 15.08 },
              { id: "9", name: "滷小方豆干（每個）", protein: 5.25, carbs: 2.8, fat: 3.9 },
              { id: "10", name: "蘭花干（每個）", protein: 13, carbs: 0, fat: 16 },
              { id: "11", name: "鳥蛋（每顆 9g）", protein: 1.1, carbs: 0.1, fat: 1.2 },
              { id: "13", name: "堅果(每1g)", protein: 0.179, carbs: 0.22, fat: 0.55 },
              { id: "14", name: "豬後腿肉(每100g)", protein: 20.4, carbs: 0.4, fat: 4 },
              { id: "15", name: "乳清蛋白(每1g)", protein: 0.72, carbs: 0.15, fat: 0.07 },
              { id: "16", name: "燕麥(每1g)", protein: 0.11, carbs: 0.61, fat: 0.09 },
              { id: "17", name: "自助餐(每100g)", protein: 0, carbs: 0, fat: 9 },
              { id: "18", name: "去皮生雞腿肉(每100g)", protein: 19, carbs: 0, fat: 8.5 },
              { id: "19", name: "調味料(純碳水)", protein: 0, carbs: 10, fat: 0 },
              { id: "20", name: "毛豆仁(每10g)", protein: 1.2, carbs: 1, fat: 0.6 },
              { id: "21", name: "鯛魚肉(每100g)", protein: 18, carbs: 1.3, fat: 3.6 },
              { id: "22", name: "碳水自由度(每1g)", protein: 0, carbs: 1, fat: 0 },
              { id: "23", name: "蛋白質自由度(每1g)", protein: 1, carbs: 0, fat: 0 },
              { id: "24", name: "脂肪自由度(每1g)", protein: 0, carbs: 0, fat: 1 },
              { id: "25", name: "兩隻滷雞腿便當(1個)", protein: 46, carbs: 61, fat: 30 },
              { id: "26", name: "南瓜(每100g)", protein: 1.4, carbs: 52.6, fat: 0 },
              { id: "27", name: "秋葵(每100g)", protein: 1.7, carbs: 6.3, fat: 0.3 },
              { id: "28", name: "花椰菜(每100g)", protein: 2.5, carbs: 4.4, fat: 0.2 },
              { id: "29", name: "菠菜(每100g)", protein: 2.1, carbs: 2.9, fat: 0 },
              { id: "30", name: "鱸魚片(每100g)", protein: 19.2, carbs: 0, fat: 4.8 },
            ])
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
        console.error("[v0] Error loading data:", error)
        toast({
          title: "載入資料失敗",
          description: "無法載入資料，將使用預設值",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only load data after supabase is initialized (or determined to be unavailable)
    if (supabase !== undefined) {
      loadData()
    }
  }, [supabase])

  // 儲存資料到 localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("nutritionNeeded", JSON.stringify(nutritionNeeded))
        localStorage.setItem("nutritionHalfEat", JSON.stringify(nutritionHalfEat))
        localStorage.setItem("foodDatabase", JSON.stringify(foodDatabase))
        localStorage.setItem("intakeRecords", JSON.stringify(intakeRecords))
      } catch (error) {
        console.error("儲存資料時發生錯誤:", error)
      }
    }
  }, [nutritionNeeded, nutritionHalfEat, foodDatabase, intakeRecords, isLoading])

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

    if (supabase) {
      try {
        const { error } = await supabase.from("food_database").insert({
          id: newFood.id,
          name: newFood.name,
          protein: newFood.protein,
          carbs: newFood.carbs,
          fat: newFood.fat,
        })

        if (error) {
          console.error("[v0] Error saving food to Supabase:", error)
          toast({
            title: "警告",
            description: "食物已添加到本地，但保存到 Supabase 失敗",
            variant: "destructive",
          })
        } else {
          console.log(`[v0] Food item saved to Supabase: ${newFood.name}`)
          toast({
            title: "成功",
            description: `已新增食物：${newFood.name}`,
          })
        }
      } catch (error) {
        console.error("[v0] Error with Supabase:", error)
        toast({
          title: "警告",
          description: "食物已添加到本地，但無法連接到 Supabase",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "成功",
        description: `已新增食物：${newFood.name}（已保存到本地儲存）`,
      })
    }

    setTimeout(() => {
      try {
        localStorage.setItem("foodDatabase", JSON.stringify(updatedDatabase))
      } catch (error) {
        console.error("儲存食物資料庫時發生錯誤:", error)
      }
    }, 100)
  }

  const deleteFoodFromDatabase = async (id: string) => {
    const hasIntakeRecords = intakeRecords.some((record) => record.foodId === id)
    const updatedDatabase = foodDatabase.filter((food) => food.id !== id)
    setFoodDatabase(updatedDatabase)

    if (supabase) {
      try {
        const { error } = await supabase.from("food_database").delete().eq("id", id)

        if (error) {
          console.error("[v0] Error deleting food from Supabase:", error)
          toast({
            title: "警告",
            description: "食物已從本地刪除，但無法從 Supabase 刪除",
            variant: "destructive",
          })
        } else {
          console.log(`[v0] Food item deleted from Supabase: ${id}`)
        }
      } catch (error) {
        console.error("[v0] Error with Supabase:", error)
      }
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

    setTimeout(() => {
      try {
        localStorage.setItem("foodDatabase", JSON.stringify(updatedDatabase))
      } catch (error) {
        console.error("儲存食物資料庫時發生錯誤:", error)
      }
    }, 100)
  }

  const updateFoodInDatabase = async (updatedFood: FoodItem) => {
    const updatedDatabase = foodDatabase.map((food) => (food.id === updatedFood.id ? updatedFood : food))
    setFoodDatabase(updatedDatabase)

    if (supabase) {
      try {
        const { error } = await supabase
          .from("food_database")
          .update({
            name: updatedFood.name,
            protein: updatedFood.protein,
            carbs: updatedFood.carbs,
            fat: updatedFood.fat,
          })
          .eq("id", updatedFood.id)

        if (error) {
          console.error("[v0] Error updating food in Supabase:", error)
          toast({
            title: "警告",
            description: "食物已更新到本地，但無法保存到 Supabase",
            variant: "destructive",
          })
        } else {
          console.log(`[v0] Food item updated in Supabase: ${updatedFood.name}`)
          toast({
            title: "成功",
            description: `已更新食物：${updatedFood.name}`,
          })
        }
      } catch (error) {
        console.error("[v0] Error with Supabase:", error)
        toast({
          title: "警告",
          description: "食物已更新到本地，但無法連接到 Supabase",
          variant: "destructive",
        })
      }
    }

    const hasIntakeRecords = intakeRecords.some((record) => record.foodId === updatedFood.id)
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

      toast({
        title: "營養計算已更新",
        description: "由於更新了食物，相關的營養計算也已更新",
      })
    }

    setTimeout(() => {
      try {
        localStorage.setItem("foodDatabase", JSON.stringify(updatedDatabase))
      } catch (error) {
        console.error("儲存食物資料庫時發生錯誤:", error)
      }
    }, 100)
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
