import logo from "@/assets/logo.png"
import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { LogOut, ChevronsUpDown } from "lucide-react"

import { navItems } from "@/config/nav"
import { useAuth } from "@/context/AuthContext"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { cn, getInitials } from "@/lib/utils"


const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SALES: "Sales",
}


export function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void
}) {

  const { user, logout } = useAuth()

  const items = navItems.filter(
    (item) =>
      !item.roles ||
      (user && item.roles.includes(user.role))
  )


  return (
    <aside
      className="
        sidebar-light-gradient
        relative
        flex
        h-full
        w-[16rem]
        flex-col
        overflow-hidden
      "
    >

      {/* =====================================================
          LOGO HEADER
          IMPORTANT:
          Same height as Topbar = 4.25rem
      ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          h-[4.25rem]
          shrink-0
          items-center
          justify-center
          border-b
          border-white/45
          px-3
        "
      >

        <img
          src={logo}
          alt="MAKPHALT"
          className="
            h-[3.75rem]
            w-auto
            max-w-[210px]
            object-contain
          "
        />

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className="
          relative
          z-10
          flex-1
          overflow-y-auto
          px-3
          py-4
        "
      >

        {/* MAIN MENU */}

        <p
          className="
            px-3
            pb-2.5
            font-sans
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-[#58677f]
          "
        >
          Main Menu
        </p>


        <div className="space-y-1">

          {items.map((item) => (

            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  `
                    group
                    relative
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3.5
                    py-2.5
                    font-sans
                    text-[14px]
                    font-medium
                    tracking-[-0.01em]
                    transition-all
                    duration-150
                    ease-out
                  `,

                  isActive
                    ? `
                      bg-white/60
                      text-[#2463d4]
                      shadow-[0_2px_8px_rgba(35,57,105,0.05)]
                      ring-1
                      ring-white/70
                    `
                    : `
                      text-[#1e2a44]
                      hover:bg-white/25
                      hover:text-[#174fae]
                      hover:translate-x-[1px]
                    `
                )
              }
            >

              {({ isActive }) => (
                <>

                  {/* Active indicator */}

                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="
                        absolute
                        inset-y-2
                        left-0
                        w-[3px]
                        rounded-r-full
                        bg-[#2463d4]
                      "
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}


                  {/* Icon */}

                  <item.icon
                    className={cn(
                      `
                        relative
                        z-10
                        h-[18px]
                        w-[18px]
                        shrink-0
                        stroke-[1.9]
                        transition-colors
                        duration-150
                      `,

                      isActive
                        ? "text-[#2463d4]"
                        : "text-[#24324a] group-hover:text-[#174fae]"
                    )}
                  />


                  {/* Label */}

                  <span
                    className="
                      relative
                      z-10
                      truncate
                      leading-5
                    "
                  >
                    {item.label}
                  </span>

                </>
              )}

            </NavLink>

          ))}

        </div>

      </nav>


      {/* =====================================================
          USER PROFILE
      ====================================================== */}

      <div
        className="
          relative
          z-10
          shrink-0
          border-t
          border-white/45
          p-3
        "
      >

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <button
              className="
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                p-2.5
                text-left
                transition-all
                duration-150
                ease-out
                hover:bg-white/25
                hover:shadow-sm
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/50
              "
            >

              {/* Avatar */}

              <Avatar
                className="
                  h-9
                  w-9
                  shrink-0
                  ring-1
                  ring-white/60
                "
              >

                <AvatarFallback
                  className="
                    bg-white/40
                    font-sans
                    text-[12px]
                    font-semibold
                    text-[#24324a]
                  "
                >
                  {user
                    ? getInitials(user.fullName)
                    : "?"
                  }
                </AvatarFallback>

              </Avatar>


              {/* User details */}

              <div className="min-w-0 flex-1">

                <p
                  className="
                    truncate
                    font-sans
                    text-[14px]
                    font-semibold
                    leading-5
                    text-[#1e2a44]
                  "
                >
                  {user?.fullName}
                </p>

                <p
                  className="
                    truncate
                    font-sans
                    text-[11px]
                    font-medium
                    leading-4
                    text-[#58677f]
                  "
                >
                  {user
                    ? roleLabel[user.role]
                    : ""
                  }
                </p>

              </div>


              {/* Dropdown */}

              <ChevronsUpDown
                className="
                  h-4
                  w-4
                  shrink-0
                  text-[#4c5d78]
                  transition-colors
                  duration-150
                  group-hover:text-[#2463d4]
                "
              />

            </button>

          </DropdownMenuTrigger>


          {/* Dropdown menu */}

          <DropdownMenuContent
            align="start"
            side="top"
            sideOffset={8}
            className="
              w-[15rem]
              rounded-xl
              border-slate-200/80
              bg-white/95
              p-1.5
              shadow-lg
              backdrop-blur-xl
            "
          >

            <DropdownMenuLabel
              className="rounded-lg px-3 py-2.5"
            >

              <div
                className="
                  font-sans
                  text-[13px]
                  font-semibold
                  text-[#1e2a44]
                "
              >
                {user?.fullName}
              </div>

              <div
                className="
                  mt-0.5
                  truncate
                  font-sans
                  text-[11px]
                  font-normal
                  text-slate-500
                "
              >
                {user?.email ?? user?.username}
              </div>

            </DropdownMenuLabel>


            <DropdownMenuSeparator />


            <DropdownMenuItem
              className="
                cursor-pointer
                rounded-lg
                font-sans
                text-[13px]
              "
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </aside>
  )
}