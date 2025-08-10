"use client";

import { Form } from "@/components/ui/form";
import { PropertyFormData, propertySchema } from "@/lib/schemas";

import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useCreateNewPropertyMutation } from "@/state/api/landlordApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { toast } from "sonner";
import Header from "@/components/code/Header";
import { CustomFormField } from "@/components/code/FormField";
import { MultiSelect } from "@/components/ui/MultiSelect";

const CreateListings = () => {
  const [createProperty, { isLoading }] = useCreateNewPropertyMutation();
  const { data: user } = useGetUserProfileQuery();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      subDescription: "",
      pricePerMonth: 1000,
      securityDeposit: 500,
      applicationFee: 100,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: [],
      highlights: [],
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    if (user?.user?.role !== "MANAGER") {
      toast.error("Unauthorised, Only manager can create a listing");
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "photoUrls") {
        const files = value as File[];
        files.forEach((file: File) => {
          formData.append("images", file);
        });
      } else if (key === "amenities" || key === "highlights") {
        // Send as comma-separated string to match backend
        if (Array.isArray(value)) {
          formData.append(key, value.join(","));
        } else {
          formData.append(key, String(value));
        }
      } else {
        formData.append(key, String(value));
      }
    });
    formData.append("managerId", user?.user?.id);

    await createProperty(formData);
    toast.success("Property Listed Successfully");
  };

  return (
    <div className="p-4">
      <Header
        title="Add New Property"
        subtitle="Create a new property listing with detailed information"
      />
      <div className=" rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              console.log("Validation errors:", err);
            })}
            className="p-4 space-y-10"
          >
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <CustomFormField name="name" label="Property Name" />
                <CustomFormField
                  name="description"
                  label="Description"
                  type="text"
                />

                <CustomFormField
                  name="subDescription"
                  label="Sub Description"
                  type="textarea"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Fees */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Fees</h2>
              <CustomFormField
                name="pricePerMonth"
                label="Price per Month"
                type="number"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  name="securityDeposit"
                  label="Security Deposit"
                  type="number"
                />
                <CustomFormField
                  name="applicationFee"
                  label="Application Fee"
                  type="number"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Property Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField
                  name="beds"
                  label="Number of Beds"
                  type="number"
                />
                <CustomFormField
                  name="baths"
                  label="Number of Baths"
                  type="number"
                />
                <CustomFormField
                  name="squareFeet"
                  label="Square Feet"
                  type="number"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Pets Allowed"
                  type="switch"
                />
                <CustomFormField
                  name="isParkingIncluded"
                  label="Parking Included"
                  type="switch"
                />
              </div>
              <div className="mt-4">
                <CustomFormField
                  name="propertyType"
                  label="Property Type"
                  type="select"
                  options={Object.keys(PropertyTypeEnum).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Amenities and Highlights */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Amenities and Highlights
              </h2>
              <div className="space-y-6">
                <Controller
                  name="amenities"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium ">Amenities</label>
                      <MultiSelect
                        options={Object.keys(AmenityEnum)}
                        selected={field.value || []}
                        onChange={(value) => field.onChange(value)}
                        placeholder="Select amenities..."
                        className="w-full"
                      />
                      {form.formState.errors.amenities && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.amenities.message}
                        </p>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="highlights"
                  control={form.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Highlights</label>
                      <MultiSelect
                        options={Object.keys(HighlightEnum)}
                        selected={field.value || []}
                        onChange={(value) => field.onChange(value)}
                        placeholder="Select highlights..."
                        className="w-full"
                      />
                      {form.formState.errors.highlights && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.highlights.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Photos */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Photos</h2>
              <CustomFormField
                name="photoUrls"
                label="Property Photos"
                type="file"
                accept="image/*"
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                Additional Information
              </h2>
              <CustomFormField name="address" label="Address" />
              <div className="flex justify-between gap-4">
                <CustomFormField name="city" label="City" className="w-full" />
                <CustomFormField
                  name="state"
                  label="State"
                  className="w-full"
                />
                <CustomFormField
                  name="postalCode"
                  label="Postal Code"
                  className="w-full"
                />
              </div>
              <CustomFormField name="country" label="Country" />
            </div>
            <div className="flex justify-end items-end w-full">
              <Button type="submit" className=" w-1/2 mt-8">
                {isLoading ? "Loading" : "Create Property"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateListings;
