"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar, DollarSign, User, MapPin, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  LeaseApplicationFormData,
  leaseApplicationSchema,
} from "@/lib/schemas";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useCreateLeaseMutation } from "@/state/api/leaseApi";

interface LeaseApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

const LeaseApplicationModal = ({
  isOpen,
  onClose,
  application,
}: LeaseApplicationModalProps) => {
  const [createLease, { isLoading }] = useCreateLeaseMutation();
  const { data: user } = useGetUserProfileQuery();

  const form = useForm<LeaseApplicationFormData>({
    resolver: zodResolver(leaseApplicationSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      rent: "",
      deposit: "",
      terms: "",
    },
  });

  const watchStartDate = form.watch("startDate");

  useEffect(() => {
    if (watchStartDate) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      const formattedEndDate = endDate.toISOString().split("T")[0];
      form.setValue("endDate", formattedEndDate);
    } else {
      form.setValue("endDate", "");
    }
  }, [watchStartDate, form]);

  useEffect(() => {
    if (application && isOpen) {
      form.reset({
        startDate: "",
        endDate: "",
        rent: application.property?.pricePerMonth?.toString() || "",
        deposit: application.property?.pricePerMonth?.toString() || "",
        terms: "",
      });
    }
  }, [application, isOpen, form]);

  const onSubmit = async (data: LeaseApplicationFormData) => {
    if (user?.user?.role !== "MANAGER") {
      toast.error("Unauthorized");
      return;
    }

    const payload = {
      propertyId: application.propertyId,
      startDate: data.startDate,
      endDate: data.endDate,
      rent: Number(data.rent),
      deposit: Number(data.deposit),
      applicationFee: application.property?.applicationFee || 0,
      terms: data.terms,
      tenantId: application.tenantId,
      applicationId: application.id,
    };

    try {
      await createLease(payload).unwrap();
      toast.success("Lease created successfully");
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating lease:", error);
      toast.error("Failed to create lease");
    }
  };

  if (!application) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Create Lease Agreement
          </DialogTitle>
          <DialogDescription>
            Create a lease agreement for <strong>{application.name}</strong> at{" "}
            <strong>{application.property?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Property and Tenant Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Property
                </Label>
                <p className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {application.property?.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {application.property?.address}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tenant
                </Label>
                <p className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" />
                  {application.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {application.email}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Application Fee
              </Label>

              <p className="text-sm flex items-center text-gray-500 mt-1">
                <DollarSign className="w-4 h-4" />
                {application.property.applicationFee}
              </p>
            </div>

            {/* Lease Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} readOnly />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-calculated as 1 year from start date
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rent & Deposit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Yearly Rent
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1500"
                        {...field}
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Security Deposit
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1500"
                        {...field}
                        min="0"
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Terms */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Terms & Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional lease terms, rules, or conditions..."
                      {...field}
                      rows={4}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Creating Lease..." : "Create Lease"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaseApplicationModal;
