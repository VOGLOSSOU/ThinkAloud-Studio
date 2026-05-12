import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Library, Settings, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { episodesApi } from "@/api/client";
import toast from "react-hot-toast";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/episodes", icon: Library, label: "Mes Épisodes" },
  { to: "/settings", icon: Settings, label: "Paramètres" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => episodesApi.create("Sans titre"),
    onSuccess: (episode) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      navigate(`/episodes/${episode.id}`);
    },
    onError: () => toast.error("Impossible de créer l'épisode"),
  });

  return (
    <aside className="w-16 lg:w-56 flex flex-col h-full bg-noir border-r border-gris-studio flex-shrink-0">
      <div className="px-3 lg:px-4 py-5 border-b border-gris-studio">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ThinkAloud"
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-or/30"
          />
          <span className="hidden lg:block font-playfair text-blanc-brume font-semibold text-sm tracking-wide">
            ThinkAloud
          </span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-2 py-2.5 rounded-card transition-all duration-200 group",
                isActive
                  ? "bg-gris-nuit text-or"
                  : "text-gris-cendre hover:text-blanc-brume hover:bg-gris-nuit/50"
              )
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden lg:block font-dm text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="w-full flex items-center justify-center lg:justify-start gap-2 px-2 py-2.5
            bg-or/10 hover:bg-or/20 text-or rounded-card transition-all duration-200
            disabled:opacity-50 group"
        >
          <Plus size={18} className="flex-shrink-0" />
          <span className="hidden lg:block font-dm text-sm font-medium">Nouvel Épisode</span>
        </button>
      </div>
    </aside>
  );
}
