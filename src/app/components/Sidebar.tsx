"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) setIsOpen(false);
      else setIsOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <div
      className={clsx(
        "bg-gray-50 text-black min-h-screen transition-all duration-300 border-r border-gray-200",
        {
          "w-60": isOpen,
          "w-0 overflow-hidden": !isOpen,
        }
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 w-full text-left bg-gray-50 text-white"
      >
        ☰
      </button>

      {isOpen && (
        <nav className="mt-4 flex flex-col gap-1 px-2">
          <button
            onClick={() => setDashboardOpen(!dashboardOpen)}
            className={clsx(
              "px-4 py-2 rounded text-left w-full flex items-center justify-between transition-colors",
              {
                "bg-gray-200 text-black": isActive("/dashboard/analytics"),
                "hover:bg-gray-100": !isActive("/dashboard/analytics"),
              }
            )}
          >
            <span>Dashboard</span>
            <svg
              className={clsx(
                "w-4 h-4 transform transition-transform duration-200",
                {
                  "rotate-180": dashboardOpen,
                }
              )}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dashboardOpen && (
            <div className="ml-4 flex flex-col gap-1">
              <Link
                href="/dashboard/analytics"
                className={clsx("px-3 py-2 rounded text-sm", {
                  "bg-[#8F85F2] text-white":
                    pathname === "/dashboard/analytics",
                  "hover:bg-gray-100": pathname !== "/dashboard/analytics",
                })}
              >
                Analytics
              </Link>
              <Link
                href="/dashboard/crm"
                className={clsx("px-3 py-2 rounded text-sm", {
                  "bg-[#8F85F2] text-white": pathname === "/dashboard/crm",
                  "hover:bg-gray-100": pathname !== "/dashboard/crm",
                })}
              >
                CRM
              </Link>
              <Link
                href="/dashboard/academy"
                className={clsx("px-3 py-2 rounded text-sm", {
                  "bg-[#8F85F2] text-white":
                    pathname === "/dashboard/academy",
                  "hover:bg-gray-100": pathname !== "/dashboard/academy",
                })}
              >
                Academy
              </Link>
              <Link
                href="/dashboard/logistics"
                className={clsx("px-3 py-2 rounded text-sm", {
                  "bg-[#8F85F2] text-white":
                    pathname === "/dashboard/logistics",
                  "hover:bg-gray-100": pathname !== "/dashboard/logistics",
                })}
              >
                Logistics
              </Link>
            </div>
          )}
        </nav>
      )}
    </div>
  );
}
