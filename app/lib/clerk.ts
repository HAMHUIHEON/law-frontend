//app/lib/clerk.ts
import { useUser } from "@clerk/nextjs";

const { user } = useUser();
const userId = user?.id;
