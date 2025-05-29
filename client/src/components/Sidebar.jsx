import { createContext, useContext, useEffect, useState } from "react"
import { AlignJustify, ChevronDown, ChevronRight } from "lucide-react"
import { NavLink } from "react-router-dom"

export const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || {}
    } catch {
      return {}
    }
  })

  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    function handleStorageChange() {
      try {
        const newUserInfo = JSON.parse(localStorage.getItem("userInfo")) || {}
        setUserInfo(newUserInfo)
      } catch {
        setUserInfo({})
      }
    }

    // Listen for both storage and custom events
    window.addEventListener("storage", handleStorageChange)
    
    // Initial load
    handleStorageChange()

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const updateUserInfo = (newInfo) => {
    setUserInfo(newInfo)
    localStorage.setItem("userInfo", JSON.stringify(newInfo))
  }

  return (
    <SidebarContext.Provider value={{ expanded, userInfo, updateUserInfo, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export default function Sidebar({ children }) {
  const { expanded, userInfo, setExpanded } = useContext(SidebarContext)

  const { fullname: fullName, role, email } = userInfo

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "U"
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
  }

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-blue-100 shadow-sm">
        <div className="p-4 pb-2 flex bg-gradient-to-tr from-indigo-100 to-blue-400">
          <div className="flex items-center gap-3 px-4 transition-all duration-300">
            <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white font-bold">
              {getInitials(fullName)}
            </div>
            {expanded && (
              <div className="flex flex-col transition-opacity duration-300">
                <span className="font-semibold text-blue-900 capitalize">{fullName}</span>
                <span className="text-sm text-blue-700">{email}</span>
                <span className="text-sm text-blue-700 capitalize">{role}</span>
              </div>
            )}
          </div>
          <div
            onClick={() => setExpanded((curr) => !curr)}
            className={`burger-icon cursor-pointer hover:bg-indigo-200 p-2 ${
              expanded ? "justify-end" : "justify-center"
            }`}
          >
            <AlignJustify />
          </div>
        </div>

        {children}
      </nav>
    </aside>
  )
}

export function SidebarItem({ to, text, icon, submenu = false, children }) {
  const { expanded } = useContext(SidebarContext)
  const [isOpen, setIsOpen] = useState(false)

  if (submenu) {
    return (
      <li className="p-0 list-none">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-2 py-2 px-3 mx-1 my-1 rounded-md cursor-pointer transition-colors ${
            expanded ? "justify-between" : "justify-center"
          } hover:bg-indigo-200 text-black-600`}
        >
          <div className="flex items-center gap-2">
            {icon}
            {expanded && <span>{text}</span>}
          </div>
          {expanded && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>

        {isOpen && <ul className="pl-6 list-none">{children}</ul>}
      </li>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-2 py-2 px-3 mx-1 my-1
        font-medium rounded-md cursor-pointer transition-colors
        ${
          isActive
            ? "bg-gradient-to-tr from-indigo-100 to-blue-400 text-indigo-800"
            : "hover:bg-indigo-200 text-black-600"
        }
        ${expanded ? "justify-start" : "justify-center"}`
      }
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52" : "w-0"}`}>
        {text}
      </span>
    </NavLink>
  )
}
