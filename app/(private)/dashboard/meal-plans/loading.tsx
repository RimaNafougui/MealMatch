import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";

export default function MealPlansLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-52 rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border border-divider/50">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-48 rounded-lg" />
                <Skeleton className="h-3 w-32 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
