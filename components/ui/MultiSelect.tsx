"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = "Seleccionar...", label, className }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className || ""}`} ref={ref}>
      {label && <label className="text-sm text-gray-700 mb-1 block font-medium">{label}</label>}
      <div
        className={`flex flex-wrap items-center gap-1 border rounded-md px-3 py-1.5 bg-white min-h-[36px] focus-within:ring-2 focus-within:ring-blue-200 transition-shadow`}
        onClick={() => setOpen((v) => !v)}
        tabIndex={0}
      >
        {value.map((val) => {
          const opt = options.find((o) => o.value === val);
          if (!opt) return null;
          return (
            <span key={val} className="flex items-center gap-1 bg-blue-50 text-blue-700 rounded px-2 py-0.5 text-xs border border-blue-200">
              {opt.label}
              <button
                type="button"
                className="ml-1 text-blue-500 hover:text-red-500"
                onClick={e => {
                  e.stopPropagation();
                  onChange(value.filter(v => v !== val));
                }}
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        <Input
          className="border-0 shadow-none focus:ring-0 p-0 rounded-none h-auto text-sm flex-1 min-w-[60px] bg-transparent outline-none"
          placeholder={value.length === 0 ? placeholder : "Buscar..."}
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={e => { e.stopPropagation(); setOpen(true); }}
        />
      </div>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-[9999] max-h-48 overflow-y-auto animate-fade-in">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-sm">Sin opciones</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.value}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm transition-colors ${value.includes(opt.value) ? "bg-blue-50 text-blue-700" : ""}`}
                onClick={e => {
                  e.stopPropagation();
                  if (value.includes(opt.value)) {
                    onChange(value.filter(v => v !== opt.value));
                  } else {
                    onChange([...value, opt.value]);
                  }
                }}
              >
                {opt.label}
                {value.includes(opt.value) && <span className="ml-2 text-blue-500">✓</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 