import { motion } from "framer-motion";
import type { VehicleCatalogItem } from "./vehicleCatalog.ts";

export function VehicleCard({
  item,
  selected,
  onSelect
}: {
  item: VehicleCatalogItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={[
        "text-left rounded-2xl overflow-hidden border transition shadow-sm",
        selected
          ? "border-blue-300/60 bg-white/15 shadow-lg shadow-blue-500/25"
          : "border-white/12 bg-white/8 hover:bg-white/12 hover:shadow-xl"
      ].join(" ")}
    >
      <div className="h-28 w-full relative">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:brightness-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-2 left-2">
          <div className="text-[11px] px-2 py-1 rounded-full bg-white/15 border border-white/20 text-white/85">
            {item.multiplierHint}
          </div>
        </div>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-white">{item.title}</div>
            <div className="text-[11px] text-white/70">{item.subtitle}</div>
          </div>
          <div className="text-[11px] text-white/80 font-medium">ETA {item.etaMin} min</div>
        </div>
      </div>
      <div className="px-3 py-2.5 text-[12px] text-white/80 flex items-center justify-between">
        <div>{item.seats} seats</div>
        <div className="font-medium">Category: {item.title}</div>
      </div>
    </motion.button>
  );
}

