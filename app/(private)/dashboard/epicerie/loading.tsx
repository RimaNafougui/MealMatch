import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";

export default function EpicerieLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>
      <Card className="border border-divider/50">
        <CardBody className="flex flex-col gap-3 p-4">
          <Skeleton className="h-3 w-full rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-1">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="h-4 flex-1 rounded-lg" />
              <Skeleton className="h-4 w-16 rounded-lg" />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}
