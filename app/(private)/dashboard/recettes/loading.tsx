import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";

export default function RecettesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-9 w-44 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border border-divider/50">
            <Skeleton className="h-48 w-full rounded-t-xl rounded-b-none" />
            <CardBody className="flex flex-col gap-2 p-4">
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-lg mt-2" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
