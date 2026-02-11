import { Leaf } from "lucide-react";

export const Logo = () => (
  <div className="flex items-center gap-2.5">
    <div className="relative">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-success to-success-600 flex items-center justify-center shadow-lg shadow-success/20">
        <Leaf size={20} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col leading-none">
      <span className="text-xl font-bold tracking-tight text-foreground">
        MealMatch
      </span>
      <span className="text-[9px] tracking-[0.2em] font-medium uppercase text-success">
        Nutrition
      </span>
    </div>
  </div>
);
