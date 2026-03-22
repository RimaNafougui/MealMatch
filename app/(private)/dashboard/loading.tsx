import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody } from "@heroui/card";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl border border-divider/20 p-4 sm:p-6 flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl hidden sm:block" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="border border-divider/50">
            <CardBody className="flex flex-row items-center gap-4 p-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-6 w-10 rounded-lg" />
                <Skeleton className="h-3 w-24 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {/* Quick links skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="border border-divider/50">
            <CardBody className="flex flex-row items-center gap-3 p-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-3 w-36 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
