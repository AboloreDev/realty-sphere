"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lease, Payment } from "@/types/prismaTypes";

import { ArrowDownToLine, Check, Download } from "lucide-react";
import Image from "next/image";

import React from "react";

interface Inquiries {
  leases: Lease[];
  payments: Payment[];
}

const TenantInquiriesPage = ({ payments, leases }: Inquiries) => {
  // GET YEALRY PAYMENTS
  const getCurrentYearPaymentStatus = (leaseId: number) => {
    const currentDate = new Date();
    const currentYearPayment = payments?.find(
      (payment) =>
        payment.leaseId === leaseId &&
        new Date(payment.dueDate).getFullYear() === currentDate.getFullYear()
    );
    return currentYearPayment?.paymentStatus || "Not Paid";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="space-y-6">
        <div className=" rounded-xl shadow-md overflow-hidden p-1">
          <div className="flex justify-between items-center mb-4">
            <div className="flex justify-end items-end w-full">
              <Button className="flex justify-end items-end">
                <Download className="w-5 h-5" />
                <span>Download All</span>
              </Button>
            </div>
          </div>
          <hr className="mt-4 mb-1" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Yearly Rent</TableHead>
                  <TableHead>Current Year Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases?.map((lease) => (
                  <TableRow key={lease.id} className="h-24">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src=""
                          alt={lease.tenant.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-semibold">
                            {lease.tenant.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lease.tenant.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {new Date(lease.startDate).toLocaleDateString()} -
                      </div>
                      <div>{new Date(lease.endDate).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>${lease.rent.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getCurrentYearPaymentStatus(lease.id) === "Paid"
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {getCurrentYearPaymentStatus(lease.id) === "Paid" && (
                          <Check className="w-4 h-4 inline-block mr-1" />
                        )}
                        {getCurrentYearPaymentStatus(lease.id)}
                      </span>
                    </TableCell>
                    <TableCell>{lease.tenant.phoneNumber}</TableCell>
                    <TableCell>
                      <Button
                        className={`border border-gray-300 text-gray-700 py-2 px-4 rounded-md flex 
                      items-center justify-center font-semibold hover:bg-primary-700 hover:text-primary-50`}
                      >
                        <ArrowDownToLine className="w-4 h-4 mr-1" />
                        Download Agreement
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInquiriesPage;
