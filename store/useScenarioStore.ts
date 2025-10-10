import { create } from "zustand"

export interface Node {
  id: string
  name: string
  type: "trait" | "behavior" | "demographic" | "keyword" | "scenario"
  data?: any
  children?: Node[]
}

export interface Question {
  id: string
  text: string
}

export interface Scenario {
  id: string
  name: string
  description?: string
  trait?: string
  behavior?: string
  demographic: { ageRange: [number, number]; location: string }
  percentage: number
  questions: string[]
  usersAssigned: string[]
  status: "draft" | "sent"
  keywords?: string[]
}

export interface User {
  id: string
  name: string
  age: number
  location: string
  status?: "pending" | "completed"
  assignedScenarios?: string[]
}

interface ScenarioStore {
  tree: Node[]
  scenarios: Scenario[]
  users: User[]
  questions: Question[]
  addNode: (parentId: string | null, node: Node) => void
  removeNode: (nodeId: string) => void
  updateNode: (nodeId: string, updates: Partial<Node>) => void
  generateScenario: (
    minAge: number,
    maxAge: number,
    location: string,
    percentage: number,
    description?: string,
    trait?: string,
    behavior?: string,
  ) => void
  selectQuestions: (scenarioId: string, questionIds: string[]) => void
  simulateDistribution: (scenarioId: string) => void
  deleteScenario: (scenarioId: string) => void
  updateUserStatus: (userId: string, status: "completed") => void
  setTree: (tree: Node[]) => void
  exportTreeAsJSON: () => string
  exportScenariosAsJSON: () => string
  importTree: (jsonString: string) => boolean
}

// Mock initial data
const initialUsers: User[] = [
  // Đà Nẵng - Young adults (18-25)
  { id: "u1", name: "Nguyễn Văn Phong", age: 22, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },
  { id: "u2", name: "Trần Thị Linh", age: 24, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },
  { id: "u3", name: "Lê Minh Tú", age: 19, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },
  { id: "u6", name: "Phạm Thị Hương", age: 21, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },
  { id: "u11", name: "Võ Thị Mai", age: 23, location: "Đà Nẵng", status: "completed", assignedScenarios: [] },
  { id: "u12", name: "Đặng Văn Hải", age: 20, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },

  // Đà Nẵng - Adults (26-40)
  { id: "u13", name: "Bùi Thị Lan", age: 28, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },
  { id: "u14", name: "Hoàng Văn Sơn", age: 35, location: "Đà Nẵng", status: "completed", assignedScenarios: [] },
  { id: "u15", name: "Ngô Thị Thảo", age: 32, location: "Đà Nẵng", status: "pending", assignedScenarios: [] },

  // Hà Nội - Young adults (18-25)
  { id: "u16", name: "Trịnh Văn Bình", age: 22, location: "Hà Nội", status: "pending", assignedScenarios: [] },
  { id: "u17", name: "Lý Thị Nga", age: 24, location: "Hà Nội", status: "pending", assignedScenarios: [] },
  { id: "u18", name: "Phan Văn Đức", age: 21, location: "Hà Nội", status: "completed", assignedScenarios: [] },

  // Hà Nội - Adults (26-40)
  { id: "u4", name: "Vũ Thị An", age: 28, location: "Hà Nội", status: "pending", assignedScenarios: [] },
  { id: "u5", name: "Đỗ Văn Minh", age: 33, location: "Hà Nội", status: "pending", assignedScenarios: [] },
  { id: "u7", name: "Nguyễn Văn Đức", age: 30, location: "Hà Nội", status: "pending", assignedScenarios: [] },
  { id: "u19", name: "Trương Thị Hoa", age: 36, location: "Hà Nội", status: "completed", assignedScenarios: [] },
  { id: "u20", name: "Lê Văn Tùng", age: 29, location: "Hà Nội", status: "pending", assignedScenarios: [] },

  // TP.HCM - Young adults (18-25)
  { id: "u21", name: "Cao Thị Hằng", age: 23, location: "TP.HCM", status: "pending", assignedScenarios: [] },
  { id: "u22", name: "Đinh Văn Khoa", age: 25, location: "TP.HCM", status: "pending", assignedScenarios: [] },
  { id: "u23", name: "Mai Thị Trang", age: 20, location: "TP.HCM", status: "completed", assignedScenarios: [] },
  { id: "u24", name: "Hồ Văn Long", age: 22, location: "TP.HCM", status: "pending", assignedScenarios: [] },

  // TP.HCM - Adults (26-40)
  { id: "u25", name: "Dương Thị Phương", age: 31, location: "TP.HCM", status: "pending", assignedScenarios: [] },
  { id: "u26", name: "Tô Văn Hùng", age: 38, location: "TP.HCM", status: "completed", assignedScenarios: [] },
  { id: "u27", name: "Lâm Thị Xuân", age: 27, location: "TP.HCM", status: "pending", assignedScenarios: [] },
  { id: "u28", name: "Chu Văn Thắng", age: 34, location: "TP.HCM", status: "pending", assignedScenarios: [] },

  // TP.HCM - Older adults (41-60)
  { id: "u29", name: "Huỳnh Thị Kim", age: 45, location: "TP.HCM", status: "pending", assignedScenarios: [] },
  { id: "u30", name: "Trần Văn Toàn", age: 52, location: "TP.HCM", status: "completed", assignedScenarios: [] },
]

// Mock initial scenarios
const initialScenarios: Scenario[] = [
  {
    id: "scenario-sample-1",
    name: "18–25 | Đà Nẵng (60%)",
    description: "Khảo sát về thói quen mua sắm thân thiện môi trường của giới trẻ tại Đà Nẵng",
    trait: "Openness",
    behavior: "Eco-conscious shopping",
    demographic: { ageRange: [18, 25], location: "Đà Nẵng" },
    percentage: 0.6,
    questions: [],
    usersAssigned: [],
    status: "draft",
    keywords: ["vegan", "eco bag", "recycle", "sustainable"],
  },
  {
    id: "scenario-sample-2",
    name: "26–40 | Hà Nội (80%)",
    description: "Nghiên cứu lối sống tập trung vào sức khỏe của người trưởng thành tại Hà Nội",
    trait: "Conscientiousness",
    behavior: "Health-focused lifestyle",
    demographic: { ageRange: [26, 40], location: "Hà Nội" },
    percentage: 0.8,
    questions: [],
    usersAssigned: [],
    status: "draft",
    keywords: ["organic", "fitness", "wellness", "nutrition"],
  },
  {
    id: "scenario-sample-3",
    name: "20–35 | TP.HCM (50%)",
    description: "Phân tích hành vi tương tác mạng xã hội của nhóm tuổi 20-35 tại TP.HCM",
    trait: "Extraversion",
    behavior: "Social media engagement",
    demographic: { ageRange: [20, 35], location: "TP.HCM" },
    percentage: 0.5,
    questions: [],
    usersAssigned: [],
    status: "draft",
    keywords: ["social", "community", "sharing", "trending"],
  },
]

const initialQuestions: Question[] = [
  { id: "q1", text: "How often do you recycle?" },
  { id: "q2", text: "Do you prefer eco-friendly brands?" },
  { id: "q3", text: "Would you pay more for sustainable products?" },
  { id: "q4", text: "Do you use reusable bags?" },
  { id: "q5", text: "How often do you commute by bike?" },
  { id: "q6", text: "Do you buy organic food?" },
  { id: "q7", text: "How important is environmental impact in your purchasing decisions?" },
  { id: "q8", text: "Do you participate in community environmental activities?" },
]

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  tree: [],
  scenarios: initialScenarios,
  users: initialUsers,
  questions: initialQuestions,

  setTree: (tree) => set({ tree }),

  addNode: (parentId, node) => {
    set((state) => {
      const newTree = [...state.tree]
      if (!parentId) {
        newTree.push(node)
      } else {
        const addToParent = (nodes: Node[]): Node[] => {
          return nodes.map((n) => {
            if (n.id === parentId) {
              return { ...n, children: [...(n.children || []), node] }
            }
            if (n.children) {
              return { ...n, children: addToParent(n.children) }
            }
            return n
          })
        }
        return { tree: addToParent(newTree) }
      }
      return { tree: newTree }
    })
  },

  removeNode: (nodeId) => {
    set((state) => {
      const removeFromTree = (nodes: Node[]): Node[] => {
        return nodes
          .filter((n) => n.id !== nodeId)
          .map((n) => ({
            ...n,
            children: n.children ? removeFromTree(n.children) : undefined,
          }))
      }
      return { tree: removeFromTree(state.tree) }
    })
  },

  updateNode: (nodeId, updates) => {
    set((state) => {
      const updateInTree = (nodes: Node[]): Node[] => {
        return nodes.map((n) => {
          if (n.id === nodeId) {
            return { ...n, ...updates }
          }
          if (n.children) {
            return { ...n, children: updateInTree(n.children) }
          }
          return n
        })
      }
      return { tree: updateInTree(state.tree) }
    })
  },

  generateScenario: (minAge, maxAge, location, percentage, description, trait, behavior) => {
    const id = `scenario-${Date.now()}`
    const name = `${minAge}–${maxAge} | ${location} (${(percentage * 100).toFixed(0)}%)`

    const newScenario: Scenario = {
      id,
      name,
      description,
      trait,
      behavior,
      demographic: { ageRange: [minAge, maxAge], location },
      percentage,
      questions: [],
      usersAssigned: [],
      status: "draft",
      keywords: ["vegan", "eco bag", "recycle"],
    }

    set((state) => ({
      scenarios: [...state.scenarios, newScenario],
    }))
  },

  selectQuestions: (scenarioId, questionIds) => {
    set((state) => ({
      scenarios: state.scenarios.map((s) => (s.id === scenarioId ? { ...s, questions: questionIds } : s)),
    }))
  },

  simulateDistribution: (scenarioId) => {
    set((state) => {
      const scenario = state.scenarios.find((s) => s.id === scenarioId)
      if (!scenario) return state

      const eligibleUsers = state.users.filter((u) => {
        const inAgeRange = u.age >= scenario.demographic.ageRange[0] && u.age <= scenario.demographic.ageRange[1]
        const inLocation =
          scenario.demographic.location === "All Locations" || u.location === scenario.demographic.location
        return inAgeRange && inLocation
      })

      const numToAssign = Math.ceil(eligibleUsers.length * scenario.percentage)
      const shuffled = [...eligibleUsers].sort(() => Math.random() - 0.5)
      const assigned = shuffled.slice(0, numToAssign)

      console.log("[v0] Simulation Result:", {
        scenarioId: scenario.id,
        ageRange: scenario.demographic.ageRange,
        location: scenario.demographic.location,
        percentage: scenario.percentage * 100,
        questions: scenario.questions,
        assignedUsers: assigned.map((u) => u.id),
      })

      const updatedScenarios = state.scenarios.map((s) =>
        s.id === scenarioId
          ? {
              ...s,
              usersAssigned: assigned.map((u) => u.id),
              status: "sent" as const,
            }
          : s,
      )

      const updatedUsers = state.users.map((u) => {
        if (assigned.find((a) => a.id === u.id)) {
          return {
            ...u,
            assignedScenarios: [...(u.assignedScenarios || []), scenarioId],
          }
        }
        return u
      })

      return { scenarios: updatedScenarios, users: updatedUsers }
    })
  },

  deleteScenario: (scenarioId) => {
    set((state) => ({
      scenarios: state.scenarios.filter((s) => s.id !== scenarioId),
    }))
  },

  updateUserStatus: (userId, status) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, status } : u)),
    }))
  },

  exportTreeAsJSON: () => {
    const state = get()
    return JSON.stringify(state.tree, null, 2)
  },

  exportScenariosAsJSON: () => {
    const state = get()
    return JSON.stringify(state.scenarios, null, 2)
  },

  importTree: (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      if (Array.isArray(parsed)) {
        set({ tree: parsed })
        return true
      }
      return false
    } catch {
      return false
    }
  },
}))
