"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button"; // Or your preferred button

const BackButton = () => {
  const router = useRouter();

  return <Button onClick={() => router.back()}>← Back</Button>;
};

export default BackButton;
