"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, TreePine, FileText, Users, Settings, User, Brain, CheckCircle } from "lucide-react"

const navItems = [
	{
		title: "Dashboard",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Model Builder",
		href: "/dashboard/tree",
		icon: TreePine,
	},
	{
		title: "Models Verify",
		href: "/dashboard/models-verify",
		icon: CheckCircle,
	},
	{
		title: "Survey Manager",
		href: "/dashboard/survey",
		icon: FileText,
	},
	{
		title: "Users & Results",
		href: "/dashboard/users",
		icon: Users,
	},
	{
		title: "User Management",
		href: "/dashboard/users-ocean",
		icon: Brain,
	},
	{
		title: "Settings",
		href: "/dashboard/settings",
		icon: Settings,
	},
	{
		title: "Profile",
		href: "/dashboard/profile",
		icon: User,
	},
]

export function Sidebar() {
	const pathname = usePathname()

	return (
		<aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
			<div className="p-6">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
						<span className="text-primary-foreground font-bold text-lg">G</span>
					</div>
					<div>
						<h1 className="text-lg font-bold text-sidebar-foreground">GreenMind</h1>
						<p className="text-xs text-muted-foreground">System Dashboard</p>
					</div>
				</div>
			</div>

			<nav className="flex-1 space-y-1 px-3">
				{navItems.map((item) => {
					const Icon = item.icon
					const isActive = pathname === item.href

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-sidebar-accent text-sidebar-accent-foreground"
									: "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
							)}
						>
							<Icon className="h-5 w-5" />
							{item.title}
						</Link>
					)
				})}
			</nav>

			<div className="p-4 border-t border-sidebar-border">
				<div className="flex items-center gap-3 px-3 py-2">
					<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
						<User className="w-4 h-4 text-muted-foreground" />
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-sidebar-foreground truncate">Alex Johnson</p>
						<p className="text-xs text-muted-foreground truncate">alex@greenmind.com</p>
					</div>
				</div>
			</div>
		</aside>
	)
}
