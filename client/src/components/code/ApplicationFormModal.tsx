import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form } from "../ui/form";
import { CustomFormField } from "./FormField";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { ApplicationFormData, applicationSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateApplicationMutation } from "@/state/api/applicationApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { toast } from "sonner";

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: any;
  propertyId: number;
}
const ApplicationFormModal = ({
  isOpen,
  onClose,
  propertyId,
}: ApplicationFormModalProps) => {
  // Application API call
  const [createApplication, { isLoading }] = useCreateApplicationMutation();
  // get the user
  const { data: user } = useGetUserProfileQuery();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    if (user.user.role !== "TENANT") {
      toast.error("Unauthorized");
      return;
    }

    const payload = {
      applicationDate: new Date().toISOString(),
      propertyId: propertyId,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      message: data.message,
      tenantId: user.user.id,
    };

    try {
      await createApplication(payload).unwrap();
      toast.success("Application submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="mb-4">
          <DialogTitle>Submit Application for this Property</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CustomFormField
              name="name"
              label="Name"
              type="text"
              placeholder="Enter your full name"
            />
            <CustomFormField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email address"
            />
            <CustomFormField
              name="phoneNumber"
              label="Phone Number"
              type="text"
              placeholder="Enter your phone number"
            />
            <CustomFormField
              name="message"
              label="Message"
              type="textarea"
              placeholder="Enter any additional information"
            />
            <Button type="submit" className=" w-1/2">
              {isLoading ? "Loading" : "Submit Application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationFormModal;
