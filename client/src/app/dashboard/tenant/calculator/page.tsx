// app/dashboard/tenant/calculator/page.tsx
"use client";

import { useState } from "react";
import { useAppSelector } from "@/state/redux";

import { toast } from "sonner";
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui Input component
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // shadcn/ui Card

const RentalCalculatorPage = () => {
  const user = useAppSelector((state) => state.user.user);

  // Form state
  const [income, setIncome] = useState<number | "">(0);
  const [rent, setRent] = useState<number | "">(0);
  const [utilities, setUtilities] = useState<number | "">(0);
  const [fees, setFees] = useState<number | "">(0);

  // Calculate affordability and total cost
  const maxAffordableRent = income ? income * 0.3 : 0; // 30% of income
  const totalMonthlyCost = (rent || 0) + (utilities || 0) + (fees || 0);
  const isAffordable =
    (typeof rent === "number" ? rent : 0) <= maxAffordableRent;

  const handleCalculate = () => {
    if (!income || !rent) {
      toast.error("Please enter your monthly income and rent.");
      return;
    }
    toast.info(
      `Total Monthly Cost: $${totalMonthlyCost.toFixed(2)}. ${
        isAffordable
          ? "This is within your budget!"
          : "This exceeds 30% of your income."
      }`
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-center prata-regular mb-2">{user?.name}</h2>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Rental Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="income" className="block text-sm font-medium">
                Monthly Income ($)
              </label>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) =>
                  setIncome(e.target.value ? parseFloat(e.target.value) : "")
                }
                placeholder="Enter your monthly income"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="rent" className="block text-sm font-medium">
                Monthly Rent ($)
              </label>
              <Input
                id="rent"
                type="number"
                value={rent}
                onChange={(e) =>
                  setRent(e.target.value ? parseFloat(e.target.value) : "")
                }
                placeholder="Enter the monthly rent"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="utilities" className="block text-sm font-medium">
                Estimated Utilities ($)
              </label>
              <Input
                id="utilities"
                type="number"
                value={utilities}
                onChange={(e) =>
                  setUtilities(e.target.value ? parseFloat(e.target.value) : "")
                }
                placeholder="Enter estimated utilities cost"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="fees" className="block text-sm font-medium">
                Other Fees ($)
              </label>
              <Input
                id="fees"
                type="number"
                value={fees}
                onChange={(e) =>
                  setFees(e.target.value ? parseFloat(e.target.value) : "")
                }
                placeholder="Enter other fees (e.g., pet, parking)"
                className="mt-1"
              />
            </div>
            <Button onClick={handleCalculate} className="w-full">
              Calculate
            </Button>

            {(income || rent) && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold">Results</h3>
                <p>
                  Max Affordable Rent (30% of income): $
                  {maxAffordableRent.toFixed(2)}
                </p>
                <p>Total Monthly Cost: ${totalMonthlyCost.toFixed(2)}</p>
                <p
                  className={`font-medium ${
                    isAffordable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isAffordable
                    ? "Affordable: Within your budget"
                    : "Not Affordable: Exceeds 30% of income"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalCalculatorPage;
