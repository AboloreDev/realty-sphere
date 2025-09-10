"use client";

import { Button } from "@/components/ui/button";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useConfirmSatisfactionMutation } from "@/state/api/paymemtApi";
import { ConfirmSatisfactionRequest } from "@/state/types/paymentTypes";
import React from "react";
import { toast } from "sonner";

interface ConfirmSatisfactionProps {
  paymentId: string;
}

const ConfirmSatisfaction = ({ paymentId }: ConfirmSatisfactionProps) => {
  const { data: user } = useGetUserProfileQuery();
  const [confirmSatisfaction, { isLoading }] = useConfirmSatisfactionMutation();

  const handleConfirm = async () => {
    try {
      const satisfactionData: ConfirmSatisfactionRequest = {
        tenantId: user?.user?.id,
      };
      await confirmSatisfaction({ paymentId, satisfactionData }).unwrap();
      toast.success("Satisfaction confirmed successfully");
    } catch (error: any) {
      toast.error(error.data?.error || "Failed to confirm satisfaction");
    }
  };
  return (
    <Button onClick={handleConfirm} disabled={isLoading || !user?.user.id}>
      {isLoading ? "Processing..." : "Confirm Satisfaction"}
    </Button>
  );
};

export default ConfirmSatisfaction;
