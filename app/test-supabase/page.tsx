"use client";

import { useEffect } from "react";
import { supabase } from "@/utils/supabase";
export default function TestSupabasePage() {
  useEffect(() => {
    const testQuery = async () => {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);
    };

    testQuery();
  }, []);

  return <div>Check la console 👀</div>;
}

