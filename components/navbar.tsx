"use client"

import { useSyncExternalStore, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCog,
} from "lucide-react"

import { cn } from "cn"
import { authClient, type AuthUser } from "@/lib/auth-client"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type NavItem = {
  href: string
  label: string
  items?: { href: string; label: string }[]
}

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "Browse Tuitions" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
]

const desktopLinkClass =
  "relative flex h-16 items-center gap-1 px-3 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"

const activeDesktopLinkClass =
  "text-burgundy-600 hover:text-burgundy-600 dark:text-burgundy-400 dark:hover:text-burgundy-400 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-burgundy-600 dark:after:bg-burgundy-400"

function subscribeNoop() {
  return () => {}
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center rounded-full border bg-muted p-0.5"
    >
      <span
        className={cn(
          "rounded-full p-1.5 text-amber-500",
          !isDark && "bg-background shadow-sm"
        )}
      >
        <Sun className="size-4" />
      </span>
      <span
        className={cn(
          "rounded-full p-1.5 text-muted-foreground",
          isDark && "bg-background text-foreground shadow-sm"
        )}
      >
        <Moon className="size-4" />
      </span>
    </button>
  )
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
  return initials.toUpperCase() || "?"
}

function Avatar({ user }: { user: AuthUser }) {
  if (user.image) {
    return (
      <span className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
        {/* Profile pictures come from arbitrary OAuth providers. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={user.image} alt="" className="size-full object-cover" />
      </span>
    )
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-burgundy-600 text-xs font-bold text-white ring-1 ring-border dark:bg-burgundy-700">
      {getInitials(user.name)}
    </span>
  )
}

function useAuthUser() {
  const { data } = authClient.useSession()
  return data ? (data.user as AuthUser) : null
}

function useSignOut() {
  const router = useRouter()

  return async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }
}

function AccountMenu() {
  const user = useAuthUser()
  const signOut = useSignOut()

  if (!user) {
    return (
      <div className="hidden items-center gap-2 lg:flex">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Sign In
        </Link>
        <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
          Get Started
          <ArrowRight />
        </Link>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${user.name}`}
        className="flex items-center gap-2 rounded-full border py-1 pr-2 pl-1 transition-colors hover:bg-muted"
      >
        <Avatar user={user} />
        <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
          {user.name}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <div className="mb-1 border-b px-2.5 pt-1.5 pb-2">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuItem
          render={<Link href="/profile" />}
          className="gap-2.5 px-2.5 py-2"
        >
          <UserCog className="text-muted-foreground" />
          Update Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="gap-2.5 px-2.5 py-2"
        >
          <LogOut className="text-muted-foreground" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Wordmark() {
  return (
    <>
      <span
        aria-hidden
        className="size-7 bg-burgundy-600 [mask-image:url(/images/logo.svg)] [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat] [-webkit-mask-image:url(/images/logo.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain] dark:bg-burgundy-400"
      />
      <span className="text-lg font-bold tracking-tight">
        Mentor
        <span className="text-burgundy-600 dark:text-burgundy-400">Lagbe</span>
      </span>
    </>
  )
}

function mobileLinkClass(active: boolean) {
  return cn(
    "flex items-center rounded-md px-3 py-2.5 text-base font-medium transition-colors",
    active
      ? "bg-burgundy-50 text-burgundy-700 dark:bg-burgundy-950 dark:text-burgundy-400"
      : "text-foreground/80 hover:bg-muted hover:text-foreground"
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const user = useAuthUser()
  const signOut = useSignOut()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="MentorLagbe home"
            className="flex shrink-0 items-center gap-2"
          >
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center lg:flex">
            {navItems.map((item) =>
              item.items ? (
                <DropdownMenu key={item.href}>
                  <DropdownMenuTrigger
                    aria-current={
                      isActivePath(pathname, item.href) ? "page" : undefined
                    }
                    className={cn(
                      "relative flex h-16 cursor-pointer items-center gap-1 px-3 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground",
                      isActivePath(pathname, item.href) &&
                        activeDesktopLinkClass
                    )}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-44">
                    {item.items.map((sub) => (
                      <DropdownMenuItem
                        key={sub.href}
                        render={<Link href={sub.href} />}
                      >
                        {sub.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    isActivePath(pathname, item.href) ? "page" : undefined
                  }
                  className={cn(
                    desktopLinkClass,
                    isActivePath(pathname, item.href) && activeDesktopLinkClass
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <AccountMenu />

          <div className="lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                aria-label="Open menu"
                render={<Button variant="ghost" size="icon" />}
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="flex items-center gap-2">
                    <Wordmark />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu
                  </SheetDescription>
                  {user && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {user.name}
                      <span className="block truncate text-xs">
                        {user.email}
                      </span>
                    </p>
                  )}
                </SheetHeader>

                <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                  {navItems.map((item) =>
                    item.items ? (
                      <div key={item.href} className="flex flex-col">
                        <Link
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          aria-current={
                            isActivePath(pathname, item.href)
                              ? "page"
                              : undefined
                          }
                          className={mobileLinkClass(
                            isActivePath(pathname, item.href)
                          )}
                        >
                          {item.label}
                        </Link>
                        <div className="ml-4 flex flex-col border-l pl-3">
                          {item.items
                            .filter((sub) => sub.href !== item.href)
                            .map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setSheetOpen(false)}
                                className={cn(
                                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSheetOpen(false)}
                        aria-current={
                          isActivePath(pathname, item.href) ? "page" : undefined
                        }
                        className={mobileLinkClass(
                          isActivePath(pathname, item.href)
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>

                <SheetFooter className="border-t">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setSheetOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }))}
                      >
                        Update Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSheetOpen(false)
                          void signOut()
                        }}
                        className={cn(buttonVariants({}))}
                      >
                        Sign Out
                        <LogOut />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        onClick={() => setSheetOpen(false)}
                        className={cn(buttonVariants({ variant: "outline" }))}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        onClick={() => setSheetOpen(false)}
                        className={buttonVariants({})}
                      >
                        Get Started
                        <ArrowRight />
                      </Link>
                    </>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
