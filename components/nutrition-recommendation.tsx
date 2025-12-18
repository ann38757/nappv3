"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { FoodItem, NutritionData } from "@/types/nutrition"

interface NutritionRecommendationProps {
  nutritionWanted: NutritionData
  foodDatabase: FoodItem[]
  onUpdateIntake: (records: { foodId: string; units: number }[]) => void
}

export default function NutritionRecommendation({
  nutritionWanted,
  foodDatabase,
  onUpdateIntake,
}: NutritionRecommendationProps) {
  // 修改 selectedFoods 的數據結構，從字符串數組改為對象數組，包含是否手動指定份數的信息
  const [selectedFoods, setSelectedFoods] = useState<{ id: string; manualUnits: boolean; units: number }[]>([])

  // 移除全局的 enableManualUnits 狀態
  // const [enableManualUnits, setEnableManualUnits] = useState(false)

  // 手動指定的份數
  const [manualUnits, setManualUnits] = useState<{ [foodId: string]: number }>({})

  // 推薦結果
  const [recommendations, setRecommendations] = useState<
    {
      foodId: string
      units: number
      nutrition: {
        protein: number
        carbon: number
        fat: number
      }
    }[]
  >([])

  // 多套方案
  const [alternativePlans, setAlternativePlans] = useState<
    {
      recommendations: {
        foodId: string
        units: number
        nutrition: {
          protein: number
          carbon: number
          fat: number
        }
      }[]
      discardedFoods: string[]
      totalNutrition: NutritionData
      errorMetrics: {
        totalError: number
        proteinError: number
        carbonError: number
        fatError: number
      }
    }[]
  >([])

  // 當前選中的方案索引
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0)

  // 是否顯示推薦結果
  const [showResults, setShowResults] = useState(false)

  // 計算過程中捨棄的食物
  const [discardedFoods, setDiscardedFoods] = useState<string[]>([])

  // 計算誤差
  const [errorMetrics, setErrorMetrics] = useState<{
    totalError: number
    proteinError: number
    carbonError: number
    fatError: number
  }>({ totalError: 0, proteinError: 0, carbonError: 0, fatError: 0 })

  // 當營養需求變化時，重置選擇和結果
  useEffect(() => {
    setSelectedFoods([])
    setManualUnits({})
    setRecommendations([])
    setShowResults(false)
    setDiscardedFoods([])
  }, [nutritionWanted])

  // 初始化所有食物的份數為1
  useEffect(() => {
    const initialUnits: { [foodId: string]: number } = {}
    foodDatabase.forEach((food) => {
      initialUnits[food.id] = 1
    })
    setManualUnits(initialUnits)
  }, [foodDatabase])

  // 修改處理食物選擇變化的函數
  const handleFoodSelection = (foodId: string, checked: boolean) => {
    if (checked) {
      // 檢查是否已經選擇了這個食物
      const existingIndex = selectedFoods.findIndex((item) => item.id === foodId)
      if (existingIndex >= 0) {
        // 如果已經選擇了，不做任何改變
        return
      } else {
        // 如果還沒選擇，添加新的選擇，默認不手動指定份數
        setSelectedFoods((prev) => [...prev, { id: foodId, manualUnits: false, units: 1 }])
      }
    } else {
      // 取消選擇
      setSelectedFoods((prev) => prev.filter((item) => item.id !== foodId))
    }

    // 重置推薦結果
    setShowResults(false)
    setDiscardedFoods([])
  }

  // 添加切換手動指定份數的函數
  const toggleManualUnits = (foodId: string) => {
    setSelectedFoods((prev) =>
      prev.map((item) => (item.id === foodId ? { ...item, manualUnits: !item.manualUnits } : item)),
    )

    // 重置推薦結果
    setShowResults(false)
    setDiscardedFoods([])
  }

  // 更新份數的處理函數
  const handleUnitsChange = (foodId: string, units: number) => {
    setSelectedFoods((prev) => prev.map((item) => (item.id === foodId ? { ...item, units } : item)))

    // 重置推薦結果
    setShowResults(false)
    setDiscardedFoods([])
  }

  // 格式化數字，如果小數點第一位為0則不顯示小數點
  const formatNumber = (num: number) => {
    if (Math.abs(num - Math.floor(num)) < 0.1) {
      return Math.round(num).toString()
    }
    return num.toFixed(2)
  }

  // 計算總營養
  const calculateTotalNutrition = (
    recommendations: {
      foodId: string
      units: number
      nutrition: {
        protein: number
        carbon: number
        fat: number
      }
    }[],
  ) => {
    return recommendations.reduce(
      (acc, rec) => ({
        protein: acc.protein + rec.nutrition.protein,
        carbon: acc.carbon + rec.nutrition.carbon,
        fat: acc.fat + rec.nutrition.fat,
      }),
      { protein: 0, carbon: 0, fat: 0 },
    )
  }

  // 計算總誤差
  const calculateTotalError = (totalNutrition: NutritionData, targetNutrition: NutritionData) => {
    // 計算每種營養素的誤差
    const proteinError =
      targetNutrition.protein > 0
        ? Math.abs(totalNutrition.protein - targetNutrition.protein) / targetNutrition.protein
        : 0

    const carbonError =
      targetNutrition.carbon > 0 ? Math.abs(totalNutrition.carbon - targetNutrition.carbon) / targetNutrition.carbon : 0

    const fatError =
      targetNutrition.fat > 0 ? Math.abs(totalNutrition.fat - targetNutrition.fat) / targetNutrition.fat : 0

    // 給蛋白質更高的權重
    return proteinError * 3 + carbonError + fatError
  }

  // 計算絕對誤差
  const calculateAbsoluteErrors = (totalNutrition: NutritionData, targetNutrition: NutritionData) => {
    return {
      protein: targetNutrition.protein > 0 ? Math.abs(totalNutrition.protein - targetNutrition.protein) : 0,
      carbon: targetNutrition.carbon > 0 ? Math.abs(totalNutrition.carbon - targetNutrition.carbon) : 0,
      fat: targetNutrition.fat > 0 ? Math.abs(totalNutrition.fat - targetNutrition.fat) : 0,
    }
  }

  // 優化的最小誤差方案生成函數
  const generateMinimumErrorPlan = (
    foods: (FoodItem & { fixedUnits?: number; userSpecified?: boolean })[],
    targetNutrition: NutritionData,
  ) => {
    // 如果沒有營養需求，返回空結果
    if (targetNutrition.protein <= 0 && targetNutrition.carbon <= 0 && targetNutrition.fat <= 0)
      return { recommendations: [], discardedFoods: [], alternativePlans: [] }

    // 分離用戶指定份數的食物和系統可以優化的食物
    const userSpecifiedFoods = foods.filter((food) => food.userSpecified)
    const optimizableFoods = foods.filter((food) => !food.userSpecified)

    // 計算用戶指定食物的營養總量
    const userSpecifiedNutrition = userSpecifiedFoods.reduce(
      (acc, food) => {
        const units = food.fixedUnits || 1
        return {
          protein: acc.protein + food.protein * units,
          carbon: acc.carbon + food.carbs * units,
          fat: acc.fat + food.fat * units,
        }
      },
      { protein: 0, carbon: 0, fat: 0 },
    )

    // 計算剩餘需要的營養
    const remainingNutrition = {
      protein: Math.max(0, targetNutrition.protein - userSpecifiedNutrition.protein),
      carbon: Math.max(0, targetNutrition.carbon - userSpecifiedNutrition.carbon),
      fat: Math.max(0, targetNutrition.fat - userSpecifiedNutrition.fat),
    }

    // 初始化結果
    let bestSolution: {
      foodId: string
      units: number
      nutrition: {
        protein: number
        carbon: number
        fat: number
      }
      userSpecified?: boolean
    }[] = []

    // 添加用戶指定的食物到結果中
    userSpecifiedFoods.forEach((food) => {
      const units = food.fixedUnits || 1
      bestSolution.push({
        foodId: food.id,
        units,
        nutrition: {
          protein: food.protein * units,
          carbon: food.carbs * units,
          fat: food.fat * units,
        },
        userSpecified: true,
      })
    })

    // 如果沒有可優化的食物，直接返回用戶指定的食物
    if (optimizableFoods.length === 0) {
      const totalNutrition = calculateTotalNutrition(bestSolution)
      const absoluteErrors = calculateAbsoluteErrors(totalNutrition, targetNutrition)
      const totalError = calculateTotalError(totalNutrition, targetNutrition)

      return {
        recommendations: bestSolution,
        discardedFoods: [],
        alternativePlans: [
          {
            recommendations: bestSolution,
            discardedFoods: [],
            totalNutrition,
            errorMetrics: {
              totalError,
              proteinError: absoluteErrors.protein,
              carbonError: absoluteErrors.carbon,
              fatError: absoluteErrors.fat,
            },
          },
        ],
      }
    }

    // 以下是原有的優化邏輯，但現在只針對可優化的食物，並考慮用戶已指定的營養
    let minError = Number.MAX_VALUE
    let bestDiscardedFoods: string[] = []
    let optimizedSolution: {
      foodId: string
      units: number
      nutrition: {
        protein: number
        carbon: number
        fat: number
      }
    }[] = []

    // 存儲所有可能的方案
    type Plan = {
      solution: {
        foodId: string
        units: number
        nutrition: {
          protein: number
          carbon: number
          fat: number
        }
        userSpecified?: boolean
      }[]
      discardedFoods: string[]
      error: number
    }

    const allPlans: Plan[] = []

    // 嘗試使用所有可優化的食物
    const allFoodsResult = findOptimalCombination(optimizableFoods, remainingNutrition)

    // 合併用戶指定的食物和優化結果
    const combinedSolution = [...bestSolution, ...allFoodsResult.solution]

    allPlans.push({
      solution: combinedSolution,
      discardedFoods: [],
      error: allFoodsResult.error,
    })

    if (allFoodsResult.error < minError) {
      minError = allFoodsResult.error
      optimizedSolution = allFoodsResult.solution
      bestDiscardedFoods = []
    }

    // 如果可優化的食物數量大於3，嘗試捨棄1-2項食物
    if (optimizableFoods.length > 3) {
      // 嘗試捨棄1項食物
      for (let i = 0; i < optimizableFoods.length; i++) {
        const foodsWithoutOne = [...optimizableFoods.slice(0, i), ...optimizableFoods.slice(i + 1)]
        const result = findOptimalCombination(foodsWithoutOne, remainingNutrition)

        // 合併用戶指定的食物和優化結果
        const combinedSolution = [...bestSolution, ...result.solution]

        allPlans.push({
          solution: combinedSolution,
          discardedFoods: [optimizableFoods[i].id],
          error: result.error,
        })

        if (result.error < minError) {
          minError = result.error
          optimizedSolution = result.solution
          bestDiscardedFoods = [optimizableFoods[i].id]
        }
      }

      // 如果可優化的食物數量大於4，嘗試捨棄2項食物
      if (optimizableFoods.length > 4) {
        for (let i = 0; i < optimizableFoods.length - 1; i++) {
          for (let j = i + 1; j < optimizableFoods.length; j++) {
            const foodsWithoutTwo = optimizableFoods.filter((_, index) => index !== i && index !== j)
            const result = findOptimalCombination(foodsWithoutTwo, remainingNutrition)

            // 合併用戶指定的食物和優化結果
            const combinedSolution = [...bestSolution, ...result.solution]

            allPlans.push({
              solution: combinedSolution,
              discardedFoods: [optimizableFoods[i].id, optimizableFoods[j].id],
              error: result.error,
            })

            if (result.error < minError) {
              minError = result.error
              optimizedSolution = result.solution
              bestDiscardedFoods = [optimizableFoods[i].id, optimizableFoods[j].id]
            }
          }
        }
      }
    }

    // 合併最佳解決方案
    bestSolution = [...bestSolution, ...optimizedSolution]

    // 對結果進行整數單位處理
    bestSolution = bestSolution.map((item) => {
      // 如果是用戶指定的，不進行四捨五入
      if (item.userSpecified) return item

      const food = foods.find((f) => f.id === item.foodId)
      if (food && shouldUseIntegerUnits(food.name)) {
        // 對需要整數單位的食物進行四捨五入
        const roundedUnits = Math.round(item.units)
        return {
          foodId: item.foodId,
          units: roundedUnits,
          nutrition: {
            protein: food.protein * roundedUnits,
            carbon: food.carbs * roundedUnits,
            fat: food.fat * roundedUnits,
          },
        }
      }
      return item
    })

    // 排序所有方案，按誤差從小到大
    allPlans.sort((a, b) => a.error - b.error)

    // 處理所有方案的整數單位
    const processedPlans = allPlans.map((plan) => {
      const processedSolution = plan.solution.map((item) => {
        // 如果是用戶指定的，不進行四捨五入
        if (item.userSpecified) return item

        const food = foods.find((f) => f.id === item.foodId)
        if (food && shouldUseIntegerUnits(food.name)) {
          const roundedUnits = Math.round(item.units)
          return {
            foodId: item.foodId,
            units: roundedUnits,
            nutrition: {
              protein: food.protein * roundedUnits,
              carbon: food.carbs * roundedUnits,
              fat: food.fat * roundedUnits,
            },
            userSpecified: item.userSpecified,
          }
        }
        return item
      })

      return {
        solution: processedSolution,
        discardedFoods: plan.discardedFoods,
        error: plan.error,
      }
    })

    // 選擇最多3個不同的方案（如果有捨棄食物的話）
    const alternativePlans: Plan[] = []

    // 首先添加最佳方案
    alternativePlans.push({
      solution: bestSolution,
      discardedFoods: bestDiscardedFoods,
      error: minError,
    })

    // 如果最佳方案有捨棄食物，尋找其他方案
    if (bestDiscardedFoods.length > 0) {
      // 尋找不同的方案（與最佳方案捨棄的食物不同）
      for (const plan of processedPlans) {
        // 跳過已經是最佳方案的情況
        if (JSON.stringify(plan.discardedFoods) === JSON.stringify(bestDiscardedFoods)) continue

        // 檢查是否與現有替代方案捨棄的食物相同
        const isDifferent = alternativePlans.every(
          (existingPlan) => JSON.stringify(existingPlan.discardedFoods) !== JSON.stringify(plan.discardedFoods),
        )

        if (isDifferent) {
          alternativePlans.push(plan)

          // 如果已經有3個方案，就停止
          if (alternativePlans.length >= 3) break
        }
      }
    }

    // 計算每個方案的總營養和誤差指標
    const processedAlternativePlans = alternativePlans.map((plan) => {
      const totalNutrition = calculateTotalNutrition(plan.solution)
      const absoluteErrors = calculateAbsoluteErrors(totalNutrition, targetNutrition)

      return {
        recommendations: plan.solution,
        discardedFoods: plan.discardedFoods,
        totalNutrition,
        errorMetrics: {
          totalError: plan.error,
          proteinError: absoluteErrors.protein,
          carbonError: absoluteErrors.carbon,
          fatError: absoluteErrors.fat,
        },
      }
    })

    return {
      recommendations: bestSolution,
      discardedFoods: bestDiscardedFoods,
      alternativePlans: processedAlternativePlans,
    }
  }

  // 添加一個函數來判斷食物是否應該使用整數單位
  const shouldUseIntegerUnits = (foodName: string): boolean => {
    const integerUnitFoods = [
      "蒸煮麵（每份）",
      "玉米罐頭（每罐）",
      "水煮蛋（每顆）",
      "魚罐頭（每罐）",
      "蝦子（每隻）",
      "滷大黑豆干（每個）",
      "滷小方豆干（每個）",
      "蘭花干（每個）",
      "鳥蛋（每顆 9g）",
      "堅果(每1g)",
    ]

    return integerUnitFoods.includes(foodName)
  }

  // 找到最佳食物組合
  const findOptimalCombination = (foods: FoodItem[], targetNutrition: NutritionData) => {
    // 使用改進的粒子群優化算法

    // 粒子數量
    const numParticles = 20

    // 最大迭代次數
    const maxIterations = 50

    // 初始化粒子
    const particles = []
    for (let i = 0; i < numParticles; i++) {
      const position = foods.map((food) => {
        // 對於需要整數單位的食物，初始化為整數
        if (shouldUseIntegerUnits(food.name)) {
          return Math.floor(Math.random() * 4) // 0-3的整數
        }
        return Math.random() * 3 // 初始單位數在0-3之間
      })

      const velocity = foods.map(() => (Math.random() - 0.5) * 0.2) // 初始速度
      particles.push({ position, velocity, bestPosition: [...position], bestError: Number.MAX_VALUE })
    }

    // 全局最佳位置
    let globalBestPosition = [...particles[0].position]
    let globalBestError = Number.MAX_VALUE

    // 迭代優化
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      for (let i = 0; i < numParticles; i++) {
        const particle = particles[i]

        // 計算當前誤差
        const solution = foods.map((food, index) => ({
          foodId: food.id,
          units: particle.position[index],
          nutrition: {
            protein: food.protein * particle.position[index],
            carbon: food.carbs * particle.position[index], // 修正為 carbs
            fat: food.fat * particle.position[index],
          },
        }))

        const totalNutrition = calculateTotalNutrition(solution)
        const error = calculateTotalError(totalNutrition, targetNutrition)

        // 更新個體最佳位置
        if (error < particle.bestError) {
          particle.bestError = error
          particle.bestPosition = [...particle.position]
        }

        // 更新全局最佳位置
        if (error < globalBestError) {
          globalBestError = error
          globalBestPosition = [...particle.position]
        }

        // 更新速度和位置
        const w = 0.7 // 慣性權重
        const c1 = 1.5 // 認知參數
        const c2 = 1.5 // 社會參數

        for (let j = 0; j < particle.position.length; j++) {
          // 更新速度
          particle.velocity[j] =
            w * particle.velocity[j] +
            c1 * Math.random() * (particle.bestPosition[j] - particle.position[j]) +
            c2 * Math.random() * (globalBestPosition[j] - particle.position[j])

          // 更新位置
          particle.position[j] += particle.velocity[j]

          // 確保位置在合理範圍內
          particle.position[j] = Math.max(0, particle.position[j])

          // 對需要整數單位的食物進行整數化
          if (shouldUseIntegerUnits(foods[j].name)) {
            particle.position[j] = Math.round(particle.position[j])
          }
        }
      }
    }

    // 處理最終位置
    const finalPosition = [...globalBestPosition]
    for (let i = 0; i < foods.length; i++) {
      // 對需要整數單位的食物確保是整數
      if (shouldUseIntegerUnits(foods[i].name)) {
        finalPosition[i] = Math.round(finalPosition[i])
      } else {
        // 其他食物四捨五入到一位小數
        finalPosition[i] = Math.round(finalPosition[i] * 10) / 10
      }
    }

    // 構建最終解決方案
    const solution = []
    for (let i = 0; i < foods.length; i++) {
      if (finalPosition[i] > 0) {
        solution.push({
          foodId: foods[i].id,
          units: finalPosition[i],
          nutrition: {
            protein: foods[i].protein * finalPosition[i],
            carbon: foods[i].carbs * finalPosition[i], // 修正為 carbs
            fat: foods[i].fat * finalPosition[i],
          },
        })
      }
    }

    return { solution, error: globalBestError }
  }

  // 修改計算最佳推薦攝取計劃的函數
  const calculateOptimalIntake = () => {
    // 如果沒有選擇食物，返回
    if (selectedFoods.length === 0) return

    // 獲取選擇的食物項目，並應用用戶指定的份數
    const selectedFoodItems = selectedFoods
      .map((selection) => {
        const food = foodDatabase.find((f) => f.id === selection.id)
        if (!food) return null

        // 創建一個新的食物對象，根據是否手動指定份數來設置屬性
        return {
          ...food,
          fixedUnits: selection.manualUnits ? selection.units : undefined, // 只有手動指定時才設置固定份數
          userSpecified: selection.manualUnits, // 只有手動指定時才標記為用戶指定
        }
      })
      .filter(Boolean) as (FoodItem & { fixedUnits?: number; userSpecified?: boolean })[]

    // If there's no nutrition needed, return empty results
    if (nutritionWanted.protein === 0 && nutritionWanted.carbon === 0 && nutritionWanted.fat === 0) {
      setRecommendations([])
      setShowResults(true)
      return
    }

    // 生成最小誤差方案，考慮用戶指定的份數
    const {
      recommendations: optimalRecommendations,
      discardedFoods,
      alternativePlans,
    } = generateMinimumErrorPlan(selectedFoodItems, nutritionWanted)

    // 設置多套方案
    setAlternativePlans(alternativePlans)
    setSelectedPlanIndex(0) // 默認選擇第一個方案（最佳方案）

    // 計算誤差指標
    const totalNutrition = calculateTotalNutrition(optimalRecommendations)
    const absoluteErrors = calculateAbsoluteErrors(totalNutrition, nutritionWanted)
    const totalError = calculateTotalError(totalNutrition, nutritionWanted)

    // 更新誤差指標
    setErrorMetrics({
      totalError,
      proteinError: absoluteErrors.protein,
      carbonError: absoluteErrors.carbon,
      fatError: absoluteErrors.fat,
    })

    // 更新推薦結果
    setRecommendations(optimalRecommendations)
    setDiscardedFoods(discardedFoods)
    setShowResults(true)
  }

  // 獲取食物名稱
  const getFoodName = (foodId: string) => {
    const food = foodDatabase.find((f) => f.id === foodId)
    return food ? food.name : ""
  }

  // 計算總營養
  const totalNutrition = calculateTotalNutrition(recommendations)

  // 計算達成率 (相對於待攝取營養)
  const achievementRate = {
    protein: nutritionWanted.protein > 0 ? totalNutrition.protein / nutritionWanted.protein : 1,
    carbon: nutritionWanted.carbon > 0 ? totalNutrition.carbon / nutritionWanted.carbon : 1,
    fat: nutritionWanted.fat > 0 ? totalNutrition.fat / nutritionWanted.fat : 1,
  }

  // 計算誤差值
  const errorValues = {
    protein: totalNutrition.protein - nutritionWanted.protein,
    carbon: totalNutrition.carbon - nutritionWanted.carbon,
    fat: totalNutrition.fat - nutritionWanted.fat,
  }

  // 檢查是否在誤差範圍內
  const isWithinErrorMargin = {
    protein: nutritionWanted.protein === 0 || Math.abs(errorValues.protein) <= 5, // 蛋白質誤差範圍
    carbon: nutritionWanted.carbon === 0 || Math.abs(errorValues.carbon) <= 7, // 碳水誤差範圍
    fat: nutritionWanted.fat === 0 || Math.abs(errorValues.fat) <= 3, // 脂肪誤差範圍
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>待攝取營養 (Wanted)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>蛋白質 (Protein)</span>
                <span>{nutritionWanted.protein}g</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>碳水化合物 (Carbon)</span>
                <span>{nutritionWanted.carbon}g</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>脂肪 (Fat)</span>
                <span>{nutritionWanted.fat}g</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {nutritionWanted.protein === 0 && nutritionWanted.carbon === 0 && nutritionWanted.fat === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">您已達成今日營養目標！</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {!showResults ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>選擇您想要的食物</CardTitle>
                  <Button onClick={calculateOptimalIntake} disabled={selectedFoods.length === 0}>
                    計算推薦攝取量
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 添加手動指定份數的開關 */}
                  {/* <div className="flex items-center justify-between">
                    <Label htmlFor="manual-units" className="font-medium">
                      手動指定份數
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="manual-units" checked={enableManualUnits} onCheckedChange={setEnableManualUnits} />
                      <span className="text-sm text-muted-foreground">
                        {enableManualUnits ? "已啟用" : "由系統自動搭配"}
                      </span>
                    </div>
                  </div> */}

                  {foodDatabase.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      尚未新增任何食物。請先在「食物資料庫」中添加食物。
                    </p>
                  ) : (
                    // 修改 UI 部分，在選擇食物時添加份數輸入框和手動指定開關
                    // 替換原有的食物選擇部分
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {foodDatabase.map((food) => {
                        // 查找當前食物是否已被選中
                        const selectedFood = selectedFoods.find((item) => item.id === food.id)
                        const isChecked = !!selectedFood
                        const isManualUnits = selectedFood?.manualUnits || false
                        const units = selectedFood?.units || 1

                        return (
                          <div
                            key={food.id}
                            className="flex flex-col p-3 border rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Checkbox
                                id={`select-food-${food.id}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => handleFoodSelection(food.id, checked === true)}
                              />
                              <Label htmlFor={`select-food-${food.id}`} className="flex-grow cursor-pointer">
                                <div className="font-medium">{food.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  蛋白質: {food.protein}g | 碳水: {food.carbs}g | 脂肪: {food.fat}g
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  熱量: {Math.round(food.protein * 4 + food.carbs * 4 + food.fat * 9)}kcal
                                </div>
                              </Label>
                            </div>

                            {isChecked && (
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex items-center justify-between mb-2">
                                  <Label htmlFor={`manual-units-${food.id}`} className="text-sm">
                                    指定份數
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id={`manual-units-${food.id}`}
                                      checked={isManualUnits}
                                      onCheckedChange={() => toggleManualUnits(food.id)}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      {isManualUnits ? "手動指定" : "自動計算"}
                                    </span>
                                  </div>
                                </div>

                                {isManualUnits && (
                                  <div className="flex items-center space-x-2">
                                    <Label htmlFor={`units-${food.id}`} className="text-sm">
                                      份數:
                                    </Label>
                                    <Input
                                      id={`units-${food.id}`}
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      value={units}
                                      onChange={(e) => {
                                        const newUnits = Number.parseFloat(e.target.value) || 1
                                        handleUnitsChange(food.id, newUnits)
                                      }}
                                      className="w-20"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>最佳攝取計劃</CardTitle>
                  <Button variant="outline" onClick={() => setShowResults(false)}>
                    重新選擇食物
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {alternativePlans[selectedPlanIndex].recommendations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    無法根據選擇的食物滿足營養需求。請嘗試選擇更多不同種類的食物。
                  </p>
                ) : (
                  <>
                    {discardedFoods.length > 0 && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          <Badge variant="outline" className="mr-2 bg-primary/10">
                            算法優化
                          </Badge>
                          為了獲得更精確的營養配比，系統自動捨棄了以下食物：
                          {discardedFoods.map((id) => (
                            <span key={id} className="font-medium ml-1">
                              {getFoodName(id)}
                              {discardedFoods.indexOf(id) < discardedFoods.length - 1 ? "、" : ""}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}

                    {alternativePlans.length > 1 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">可選方案</h3>
                        <div className="flex flex-wrap gap-2">
                          {alternativePlans.map((plan, index) => (
                            <Button
                              key={index}
                              variant={selectedPlanIndex === index ? "default" : "outline"}
                              onClick={() => setSelectedPlanIndex(index)}
                              className="flex-1"
                            >
                              方案 {index + 1}
                              {plan.discardedFoods.length > 0 && (
                                <span className="ml-1 text-xs">(捨棄 {plan.discardedFoods.length} 項)</span>
                              )}
                            </Button>
                          ))}
                        </div>

                        {selectedPlanIndex > 0 && alternativePlans[selectedPlanIndex].discardedFoods.length > 0 && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">
                              <Badge variant="outline" className="mr-2 bg-primary/10">
                                方案 {selectedPlanIndex + 1}
                              </Badge>
                              此方案捨棄了以下食物：
                              {alternativePlans[selectedPlanIndex].discardedFoods.map((id) => (
                                <span key={id} className="font-medium ml-1">
                                  {getFoodName(id)}
                                  {alternativePlans[selectedPlanIndex].discardedFoods.indexOf(id) <
                                  alternativePlans[selectedPlanIndex].discardedFoods.length - 1
                                    ? "、"
                                    : ""}
                                </span>
                              ))}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {alternativePlans[selectedPlanIndex].recommendations.map((rec, index) => {
                        const food = foodDatabase.find((f) => f.id === rec.foodId)
                        if (!food) return null

                        const calories = Math.round(
                          rec.nutrition.protein * 4 + rec.nutrition.carbon * 4 + rec.nutrition.fat * 9,
                        )

                        return (
                          <Card key={`${rec.foodId}-${index}`} className="overflow-hidden border-2">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{getFoodName(rec.foodId)}</h3>
                                <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                                  {rec.units} 單位
                                </div>
                              </div>

                              <div className="space-y-2 mt-3">
                                <div className="flex justify-between text-sm">
                                  <span>蛋白質:</span>
                                  <span className="font-medium">{rec.nutrition.protein.toFixed(1)}g</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>碳水化合物:</span>
                                  <span className="font-medium">{rec.nutrition.carbon.toFixed(1)}g</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>脂肪:</span>
                                  <span className="font-medium">{rec.nutrition.fat.toFixed(1)}g</span>
                                </div>
                                <div className="flex justify-between text-sm pt-1 border-t">
                                  <span>總熱量:</span>
                                  <span className="font-medium">{calories} kcal</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-semibold">營養達成率</h3>

                      {(() => {
                        const currentTotalNutrition = alternativePlans[selectedPlanIndex].totalNutrition

                        // 修改達成率計算
                        const currentAchievementRate = {
                          protein:
                            nutritionWanted.protein > 0 ? currentTotalNutrition.protein / nutritionWanted.protein : 1,
                          carbon:
                            nutritionWanted.carbon > 0 ? currentTotalNutrition.carbon / nutritionWanted.carbon : 1,
                          fat: nutritionWanted.fat > 0 ? currentTotalNutrition.fat / nutritionWanted.fat : 1,
                        }

                        // 修改誤差值計算
                        const currentErrorValues = {
                          protein: currentTotalNutrition.protein - nutritionWanted.protein,
                          carbon: currentTotalNutrition.carbon - nutritionWanted.carbon,
                          fat: currentTotalNutrition.fat - nutritionWanted.fat,
                        }

                        // 檢查是否在誤差範圍內
                        const currentIsWithinErrorMargin = {
                          protein: nutritionWanted.protein === 0 || Math.abs(currentErrorValues.protein) <= 5,
                          carbon: nutritionWanted.carbon === 0 || Math.abs(currentErrorValues.carbon) <= 7,
                          fat: nutritionWanted.fat === 0 || Math.abs(currentErrorValues.fat) <= 3,
                        }

                        return (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>蛋白質 (Protein)</span>
                                <span
                                  className={!currentIsWithinErrorMargin.protein ? "text-destructive font-medium" : ""}
                                >
                                  {currentTotalNutrition.protein.toFixed(1)}g / {nutritionWanted.protein}g (
                                  {formatNumber(currentAchievementRate.protein * 100)}%)
                                  {currentErrorValues.protein > 0
                                    ? ` +${currentErrorValues.protein.toFixed(1)}g`
                                    : currentErrorValues.protein < 0
                                      ? ` ${currentErrorValues.protein.toFixed(1)}g`
                                      : ""}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, currentAchievementRate.protein * 100)}
                                className={`h-2 ${!currentIsWithinErrorMargin.protein ? "bg-destructive/20" : ""}`}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>碳水化合物 (Carbon)</span>
                                <span
                                  className={!currentIsWithinErrorMargin.carbon ? "text-destructive font-medium" : ""}
                                >
                                  {currentTotalNutrition.carbon.toFixed(1)}g / {nutritionWanted.carbon}g (
                                  {formatNumber(currentAchievementRate.carbon * 100)}%)
                                  {currentErrorValues.carbon > 0
                                    ? ` +${currentErrorValues.carbon.toFixed(1)}g`
                                    : currentErrorValues.carbon < 0
                                      ? ` ${currentErrorValues.carbon.toFixed(1)}g`
                                      : ""}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, currentAchievementRate.carbon * 100)}
                                className={`h-2 ${!currentIsWithinErrorMargin.carbon ? "bg-destructive/20" : ""}`}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>脂肪 (Fat)</span>
                                <span className={!currentIsWithinErrorMargin.fat ? "text-destructive font-medium" : ""}>
                                  {currentTotalNutrition.fat.toFixed(1)}g / {nutritionWanted.fat}g (
                                  {formatNumber(currentAchievementRate.fat * 100)}%)
                                  {currentErrorValues.fat > 0
                                    ? ` +${currentErrorValues.fat.toFixed(1)}g`
                                    : currentErrorValues.fat < 0
                                      ? ` ${currentErrorValues.fat.toFixed(1)}g`
                                      : ""}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(100, currentAchievementRate.fat * 100)}
                                className={`h-2 ${!currentIsWithinErrorMargin.fat ? "bg-destructive/20" : ""}`}
                              />
                            </div>

                            {/* 添加不合格原因說明 */}
                            {(!currentIsWithinErrorMargin.protein ||
                              !currentIsWithinErrorMargin.carbon ||
                              !currentIsWithinErrorMargin.fat) && (
                              <div className="p-4 bg-destructive/10 rounded-lg mt-2 text-sm">
                                <p className="font-medium mb-1">不合格原因：</p>
                                <ul className="list-disc pl-5 space-y-1">
                                  {!currentIsWithinErrorMargin.protein && (
                                    <li>
                                      蛋白質{currentErrorValues.protein > 0 ? "超出" : "不足"}
                                      {Math.abs(currentErrorValues.protein).toFixed(1)}g （誤差範圍：±5g）
                                    </li>
                                  )}
                                  {!currentIsWithinErrorMargin.carbon && (
                                    <li>
                                      碳水化合物{currentErrorValues.carbon > 0 ? "超出" : "不足"}
                                      {Math.abs(currentErrorValues.carbon).toFixed(1)}g （誤差範圍：±7g）
                                    </li>
                                  )}
                                  {!currentIsWithinErrorMargin.fat && (
                                    <li>
                                      脂肪{currentErrorValues.fat > 0 ? "超出" : "不足"}
                                      {Math.abs(currentErrorValues.fat).toFixed(1)}g （誤差範圍：±3g）
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            <div className="p-4 bg-muted rounded-lg mt-4">
                              <p className="text-sm font-medium">
                                總熱量:{" "}
                                {Math.round(
                                  currentTotalNutrition.protein * 4 +
                                    currentTotalNutrition.carbon * 4 +
                                    currentTotalNutrition.fat * 9,
                                )}{" "}
                                kcal
                              </p>
                            </div>

                            {/* 添加保存推薦方案按鈕 */}
                            <Button
                              className="w-full mt-4"
                              onClick={() => {
                                // 將當前選中的推薦方案轉換為攝取記錄
                                const records = alternativePlans[selectedPlanIndex].recommendations.map((rec) => ({
                                  foodId: rec.foodId,
                                  units: rec.units,
                                }))

                                // 更新攝取記錄
                                onUpdateIntake(records)

                                // 顯示成功訊息
                                alert("已將推薦方案加入到食物攝取記錄中！")
                              }}
                            >
                              將此方案加入到食物攝取記錄
                            </Button>
                          </>
                        )
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
