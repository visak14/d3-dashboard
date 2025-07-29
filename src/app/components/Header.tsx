"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/me");
      const data = await res.json();
      setEmail(data.email );
    }
    fetchUser();
  }, []);

  const logout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 dark:text-white">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-4 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex items-center gap-4 ml-4">
       
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold"
          >
            {email.charAt(0).toUpperCase()}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 shadow rounded py-1">
              <button
                onClick={logout}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
