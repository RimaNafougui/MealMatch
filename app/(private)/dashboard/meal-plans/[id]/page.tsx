"use client";

import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Divider, Chip } from "@heroui/react";
import { Calendar, Clock, Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MealPlanDetailPage() {
    const params = useParams();
    const planId = params.id as string;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex items-center gap-2">
                <Button
                    as={Link}
                    href="/dashboard/meal-plans"
                    variant="light"
                    startContent={<ArrowLeft size={18} />}
                >
                    Retour aux plans
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader className="flex flex-col items-start gap-2 p-6">
                    <div className="flex justify-between w-full items-center">
                        <h1 className="text-3xl font-bold">Mon Plan de Repas Hebdomadaire</h1>
                        <Chip color="success" variant="flat">Généré avec succès</Chip>
                    </div>
                    <p className="text-default-500">ID du plan : {planId}</p>

                    <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-default-600">
                            <Calendar size={16} /> 7 jours
                        </div>
                        <div className="flex items-center gap-1 text-sm text-default-600">
                            <Utensils size={16} /> 21 repas
                        </div>
                        <div className="flex items-center gap-1 text-sm text-default-600">
                            <Clock size={16} /> ~30 min par repas
                        </div>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                    <div className="bg-default-100 p-8 rounded-xl border-2 border-dashed border-default-300 flex flex-col items-center justify-center text-center">
                        <Utensils className="h-12 w-12 text-default-400 mb-4" />
                        <h3 className="text-xl font-semibold">Détails du plan généré</h3>
                        <p className="text-default-500 max-w-md mt-2">
                            Ceci est une page mocke.
                        </p>
                        <Button color="primary" className="mt-6" variant="shadow">
                            Voir la liste des courses
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
