"use client";

import React, { useState } from "react";
import {
  useGetTenantPaymentsQuery,
  useGetPaymentStatusQuery,
} from "@/state/api/paymemtApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  DollarSign,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useGetUserProfileQuery } from "@/state/api/authApi";

// Types - Updated to match your backend structure
interface PaymentWithDetails {
  id: number;
  amountDue: number;
  amountPaid: number | null;
  paymentStatus: string;
  escrowStatus: string;
  dueDate: string;
  paymentDate: string | null;
  createdAt: string;
  stripePaymentId: string | null;
  escrowReleaseDate: string | null;
  lease: {
    id: number;
    tenantId: string;
    tenant: {
      name: string;
      email: string;
      phoneNumber: string;
    };
    property: {
      location: {
        address: string;
        city: string;
        state: string;
      };
      manager: {
        name: string;
        email: string;
        phoneNumber: string;
      };
    };
  };
}

const PaymentHistory = () => {
  const { data: user } = useGetUserProfileQuery();
  const tenantId = user?.user.id;
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  );

  // Fetch all payments for the tenant
  const {
    data: paymentsData,
    isLoading,
    error,
  } = useGetTenantPaymentsQuery(tenantId);

  // Fetch detailed status for selected payment
  const { data: paymentStatusData } = useGetPaymentStatusQuery(
    selectedPaymentId!,
    { skip: !selectedPaymentId }
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      Paid: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      Failed: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      Overdue: {
        variant: "destructive" as const,
        icon: AlertTriangle,
        color: "text-red-600",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getEscrowBadge = (escrowStatus: string) => {
    const escrowConfig = {
      NONE: { variant: "outline" as const, label: "No Escrow" },
      IN_ESCROW: { variant: "secondary" as const, label: "In Escrow" },
      RELEASED: { variant: "default" as const, label: "Released" },
    };

    const config =
      escrowConfig[escrowStatus as keyof typeof escrowConfig] ||
      escrowConfig.NONE;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Loading your payment records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-5 h-5" />
            Error Loading Payments
          </CardTitle>
          <CardDescription>
            Unable to fetch payment history. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // @ts-expect-error "no error"
  const payments: PaymentWithDetails[] = paymentsData?.data ?? [];

  if (payments.length === 0) {
    return (
      <div className="p-4">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>No payment records found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                You haven&apos;t made any payments yet.
              </p>
              <p className="text-sm text-gray-500">
                Payment records will appear here once you start making rent
                payments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate summary stats
  const totalPaid = payments
    .filter((p: PaymentWithDetails) => p.paymentStatus === "Paid")
    .reduce(
      (sum: number, p: PaymentWithDetails) => sum + (p.amountPaid || 0),
      0
    );

  const pendingAmount = payments
    .filter((p: PaymentWithDetails) => p.paymentStatus === "Pending")
    .reduce((sum: number, p: PaymentWithDetails) => sum + p.amountDue, 0);

  return (
    <div className="space-y-6 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View all your payment records and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Escrow Status</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment: PaymentWithDetails) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payment.lease.property.location.address}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.lease.property.location.city},{" "}
                        {payment.lease.property.location.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amountDue)}
                  </TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                  <TableCell>{getEscrowBadge(payment.escrowStatus)}</TableCell>
                  <TableCell>
                    {payment.paymentDate
                      ? formatDate(payment.paymentDate)
                      : "Not paid"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPaymentId(payment.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Payment Details</DialogTitle>
                          <DialogDescription>
                            Detailed information for Payment #{payment.id}
                          </DialogDescription>
                        </DialogHeader>

                        {paymentStatusData ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Payment Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Payment ID:
                                    </span>
                                    <span>{payment.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Amount Due:
                                    </span>
                                    <span className="font-medium">
                                      {formatCurrency(payment.amountDue)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Amount Paid:
                                    </span>
                                    <span className="font-medium">
                                      {payment.amountPaid
                                        ? formatCurrency(payment.amountPaid)
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Due Date:
                                    </span>
                                    <span>{formatDate(payment.dueDate)}</span>
                                  </div>
                                  {payment.stripePaymentId && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Stripe ID:
                                      </span>
                                      <span className="font-mono text-xs">
                                        {payment.stripePaymentId.substring(
                                          0,
                                          20
                                        )}
                                        ...
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">
                                  Status Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Payment Status:
                                    </span>
                                    {getStatusBadge(payment.paymentStatus)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">
                                      Escrow Status:
                                    </span>
                                    {getEscrowBadge(payment.escrowStatus)}
                                  </div>
                                  {paymentStatusData?.data?.status
                                    ?.daysLeftInEscrow != null &&
                                    paymentStatusData.data.status
                                      .daysLeftInEscrow >= 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Days left in Escrow:
                                        </span>
                                        <span>
                                          {
                                            paymentStatusData.data.status
                                              .daysLeftInEscrow
                                          }
                                        </span>
                                      </div>
                                    )}
                                  {payment.escrowReleaseDate && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Escrow Release:
                                      </span>
                                      <span>
                                        {formatDate(payment.escrowReleaseDate)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Property Details
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <strong>Address:</strong>{" "}
                                    {payment.lease.property.location.address}
                                  </p>
                                  <p>
                                    <strong>City:</strong>{" "}
                                    {payment.lease.property.location.city},{" "}
                                    {payment.lease.property.location.state}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-2">
                                  Tenant & Manager
                                </h4>
                                <div className="text-sm space-y-1">
                                  <p>
                                    <strong>Tenant:</strong>{" "}
                                    {payment.lease.tenant.name}
                                  </p>
                                  <p>
                                    <strong>Manager:</strong>{" "}
                                    {payment.lease.property.manager.name}
                                  </p>
                                  <p>
                                    <strong>Manager Email:</strong>{" "}
                                    {payment.lease.property.manager.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
