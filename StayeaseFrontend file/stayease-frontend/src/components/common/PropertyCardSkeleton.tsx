import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function PropertyCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={220} />
      <CardContent>
        <Stack spacing={1}>
          <Skeleton variant="text" height={34} />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rounded" height={40} />
        </Stack>
      </CardContent>
    </Card>
  );
}