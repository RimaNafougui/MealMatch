"use client";

import dynamic from "next/dynamic";

const GenerateMealPlanClient = dynamic(
    () => import("@/components/dashboard/GenerateMealPlanClient"),
    { ssr: false }
);

export default function GenerateMealPlanPage() {
    return <GenerateMealPlanClient />;
}
