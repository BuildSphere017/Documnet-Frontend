import { Menu, Search, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useAuth } from "@/context/AuthContext"
import { getInitials } from "@/lib/utils"


export function Topbar({
  onOpenSidebar,
  onOpenCommand,
}: {
  onOpenSidebar: () => void
  onOpenCommand: () => void
}) {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  return (
    <header
      className="
        glass-topbar
        sticky
        top-0
        z-30
        flex
        h-[4.25rem]
        items-center
        gap-4
        border-b
        border-white/30
        px-5
        sm:px-7
      "
    >

      {/* =====================================================
          MOBILE SIDEBAR BUTTON
      ====================================================== */}

      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSidebar}
        className="
          h-9
          w-9
          shrink-0
          rounded-xl
          text-[#263752]
          transition-all
          duration-200
          hover:bg-white/45
          hover:text-[#2463d4]
          lg:hidden
        "
      >
        <Menu className="h-[19px] w-[19px]" />
      </Button>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <button
        type="button"
        onClick={onOpenCommand}
        className="
          group
          flex
          h-[40px]
          w-full
          max-w-[680px]
          min-w-0
          items-center
          gap-3
          rounded-xl
          border
          border-[#8ea4c4]/45
          bg-white/60
          px-3.5
          text-left
          shadow-[0_2px_8px_rgba(30,55,100,0.05)]
          backdrop-blur-md
          transition-all
          duration-200
          ease-out
          hover:border-[#2463d4]/40
          hover:bg-white/75
          hover:shadow-[0_5px_16px_rgba(30,55,100,0.08)]
          focus:outline-none
          focus:ring-2
          focus:ring-[#2463d4]/15
        "
      >

        <Search
          className="
            h-[17px]
            w-[17px]
            shrink-0
            text-[#526a8b]
            transition-colors
            duration-200
            group-hover:text-[#2463d4]
          "
        />

        <span
          className="
            min-w-0
            flex-1
            truncate
            font-sans
            text-[13px]
            font-medium
            text-[#526783]
          "
        >
          <span className="sm:hidden">
            Search…
          </span>

          <span className="hidden sm:inline">
            Search documents, people, actions…
          </span>
        </span>

        <kbd
          className="
            hidden
            shrink-0
            items-center
            rounded-md
            border
            border-[#9aaec8]/50
            bg-white/65
            px-2
            py-1
            font-sans
            text-[10px]
            font-medium
            text-[#61738c]
            shadow-[0_1px_2px_rgba(15,23,42,0.04)]
            md:inline-flex
          "
        >
          ⌘ K
        </kbd>

      </button>


      {/* =====================================================
          RIGHT USER AREA
      ====================================================== */}

      <div
        className="
          ml-auto
          flex
          shrink-0
          items-center
          pr-1
        "
      >

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <button
              className="
                group
                flex
                h-[40px]
                items-center
                gap-2.5
                rounded-xl
                px-2
                font-sans
                transition-all
                duration-200
                hover:bg-white/35
                hover:shadow-[0_2px_8px_rgba(35,57,105,0.045)]
                focus:outline-none
                focus:ring-2
                focus:ring-[#2463d4]/15
                sm:px-2.5
              "
            >

              {/* =================================================
                  AVATAR
              ================================================== */}

              <Avatar
                className="
                  h-8
                  w-8
                  shrink-0
                  ring-2
                  ring-white/70
                  shadow-[0_2px_6px_rgba(35,57,105,0.08)]
                "
              >
                <AvatarFallback
                  className="
                    bg-gradient-to-br
                    from-[#3d78dc]
                    to-[#2463d4]
                    font-sans
                    text-[10px]
                    font-semibold
                    text-white
                  "
                >
                  {user ? getInitials(user.fullName) : "?"}
                </AvatarFallback>
              </Avatar>


              {/* =================================================
                  USER INFORMATION
              ================================================== */}

              <div className="hidden min-w-0 text-left sm:block">

                <p
                  className="
                    max-w-[150px]
                    truncate
                    font-sans
                    text-[13px]
                    font-semibold
                    leading-4
                    tracking-[-0.01em]
                    text-[#1e2a44]
                  "
                >
                  {user?.fullName}
                </p>

                <p
                  className="
                    mt-0.5
                    font-sans
                    text-[10px]
                    font-medium
                    leading-3
                    text-[#60718a]
                  "
                >
                  {user?.role === "ADMIN"
                    ? "Administrator"
                    : user?.role === "MANAGER"
                      ? "Manager"
                      : "Sales"}
                </p>

              </div>


              {/* =================================================
                  CHEVRON
              ================================================== */}

              <ChevronDown
                className="
                  hidden
                  h-3.5
                  w-3.5
                  text-[#64758d]
                  transition-transform
                  duration-200
                  group-data-[state=open]:rotate-180
                  sm:block
                "
              />

            </button>

          </DropdownMenuTrigger>


          {/* =====================================================
              USER DROPDOWN
          ====================================================== */}

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="
              w-[250px]
              rounded-xl
              border
              border-slate-200/80
              bg-white/95
              p-1.5
              font-sans
              shadow-[0_14px_40px_rgba(15,23,42,0.12)]
              backdrop-blur-xl
            "
          >

            {/* User information */}

            <DropdownMenuLabel
              className="
                rounded-lg
                px-3
                py-3
              "
            >

              <div className="flex items-center gap-3">

                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback
                    className="
                      bg-[#2463d4]/10
                      font-sans
                      text-xs
                      font-semibold
                      text-[#2463d4]
                    "
                  >
                    {user ? getInitials(user.fullName) : "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">

                  <p
                    className="
                      truncate
                      font-sans
                      text-[13px]
                      font-semibold
                      text-[#1e2a44]
                    "
                  >
                    {user?.fullName}
                  </p>

                  <p
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
                  </p>

                </div>

              </div>

            </DropdownMenuLabel>


            <DropdownMenuSeparator className="my-1" />


            {/* Admin / Manager options */}

            {hasRole("ADMIN", "MANAGER") && (
              <>

                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="
                    cursor-pointer
                    rounded-lg
                    px-3
                    py-2.5
                    font-sans
                    text-[13px]
                    font-medium
                    text-slate-700
                    transition-colors
                    focus:bg-[#2463d4]/8
                    focus:text-[#2463d4]
                  "
                >
                  Profile &amp; settings
                </DropdownMenuItem>


                <DropdownMenuItem
                  onClick={() => navigate("/activity")}
                  className="
                    cursor-pointer
                    rounded-lg
                    px-3
                    py-2.5
                    font-sans
                    text-[13px]
                    font-medium
                    text-slate-700
                    transition-colors
                    focus:bg-[#2463d4]/8
                    focus:text-[#2463d4]
                  "
                >
                  My activity
                </DropdownMenuItem>


                <DropdownMenuSeparator className="my-1" />

              </>
            )}


            {/* Sign out */}

            <DropdownMenuItem
              onClick={() => logout()}
              className="
                cursor-pointer
                rounded-lg
                px-3
                py-2.5
                font-sans
                text-[13px]
                font-medium
                text-red-600
                transition-colors
                focus:bg-red-50
                focus:text-red-600
              "
            >
              Sign out
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </header>
  )
}