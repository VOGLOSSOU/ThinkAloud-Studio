import { useState } from "react";
import type { ReactNode } from "react";
import { PanelLeftOpen } from "lucide-react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-noir">
      {/* Sidebar avec animation de largeur */}
      <div
        className="flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
        style={{ width: open ? undefined : 0 }}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Bouton rouvrir — visible seulement quand sidebar fermée */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex-shrink-0 self-start mt-4 ml-2 p-2 rounded-card text-gris-cendre
            hover:text-or hover:bg-gris-nuit transition-all duration-200"
          title="Ouvrir le menu"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
