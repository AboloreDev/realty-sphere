import AppErrorCode from "../constants/appErrorCode";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
} from "../constants/httpStatus";
import { AuthRequest } from "../middleware/isAuthenticated";
import prisma from "../prismaClient";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";
import calculateNextPaymentDate from "../utils/nextPaymentDateCalcutions";

// get all lease
export const getAllLease = catchAsyncError(async (req: AuthRequest, res) => {
  const user = req.user!;
  let leases;

  // check for leases based on roles
  // fetch all lease for tenant
  if (user.role === "TENANT") {
    leases = await prisma.lease.findMany({
      where: { tenantId: user.id },
      include: {
        property: { include: { manager: true } },
        tenant: true,
      },
    });
  }
  // fetch all lease for the property listed by the landlord
  else if (user.role === "MANAGER") {
    leases = await prisma.lease.findMany({
      where: { property: { managerId: user?.id } },
      include: {
        property: { include: { manager: true } },
        tenant: true,
      },
    });
  } // Assert an error if none is found
  else {
    appAssert(false, NOT_FOUND, "No lease found");
  }

  // Format leases with next payment date
  const formattedLeases = leases.map((lease) => {
    const nextPaymentDate = calculateNextPaymentDate(
      lease.startDate,
      lease.endDate
    );

    return {
      ...lease,
      nextPaymentDate,
    };
  });

  return res.status(OK).json({
    success: true,
    message: "Lease fetched Successfully",
    leases: formattedLeases,
  });
});

export const getLeasePayment = catchAsyncError(
  async (req: AuthRequest, res) => {
    // validate the request
    const { id } = req.params;
    const user = req.user!;

    // first check if there is a lease available
    const lease = await prisma.lease.findUnique({
      where: { id: Number(id) },
      include: { property: true },
    });

    // assert an error if no lease
    appAssert(lease, NOT_FOUND, "No Lease found");

    if (user.role === "TENANT" && lease.tenantId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your lease",
        AppErrorCode.UnauthorizedRole
      );
    }
    if (user.role === "MANAGER" && lease.property.managerId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your property",
        AppErrorCode.UnauthorizedRole
      );
    }

    // ONE-TO-ONE: Find the single payment for this lease
    let payment = await prisma.payment.findFirst({
      where: { leaseId: Number(id) },
      include: {
        lease: {
          include: {
            tenant: true,
            property: {
              include: {
                manager: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" }, // Get most recent if multiple exist
    });

    // Return a single payment object (not array)
    return res.status(OK).json(payment);
  }
);

export const createLease = catchAsyncError(async (req: AuthRequest, res) => {
  // check for user id
  const user = req.user!;
  // get the request from the body
  const {
    propertyId,
    tenantId,
    startDate,
    endDate,
    rent,
    deposit,
    applicationId,
  } = req.body;

  // restrict the role to landlord
  if (user.role !== "MANAGER") {
    appAssert(
      false,
      FORBIDDEN,
      "You are not a landlord",
      AppErrorCode.UnauthorizedRole
    );
  }

  // validate input fields
  if (
    !propertyId ||
    !tenantId ||
    !startDate ||
    !endDate ||
    !rent ||
    !deposit ||
    !applicationId
  ) {
    appAssert(
      false,
      BAD_REQUEST,
      "All fields are required",
      AppErrorCode.invalidInput
    );
  }

  // check if the property belongs to the landlord
  const property = await prisma.property.findUnique({
    where: { id: Number(propertyId) },
    include: {
      manager: true,
      leases: {
        where: {
          status: { in: ["Approved", "Pending"] }, // Only check active/pending leases
        },
        include: { property: true },
      },
    },
  });

  // if there is no property assert an error
  appAssert(
    property,
    NOT_FOUND,
    "Property not found",
    AppErrorCode.InvalidPropertyId
  );

  // verify the property belongs to this manager
  appAssert(
    property.managerId === user.id,
    FORBIDDEN,
    "You don't have permission to create leases for this property"
  );

  // check if property has active or pending leases
  appAssert(
    property.leases.length === 0,
    BAD_REQUEST,
    "This property has an active or pending lease",
    AppErrorCode.PropertyUnavailable
  );

  // check if the application status has been approved before creating a lease
  const application = await prisma.application.findFirst({
    where: {
      id: Number(applicationId),
      propertyId: Number(propertyId),
      tenantId,
      status: "Approved", // Fixed case sensitivity
    },
  });

  // assert an error if there is no approved application status
  appAssert(
    application,
    BAD_REQUEST,
    "Application status not approved or application not found"
  );

  // create a lease and update the application then wait till the tenant approves it
  const lease = await prisma.$transaction(async (prisma) => {
    const newLease = await prisma.lease.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rent: Number(rent),
        deposit: Number(deposit),
        property: { connect: { id: Number(propertyId) } },
        tenant: { connect: { id: tenantId } },
        status: "Pending",
        application: { connect: { id: Number(applicationId) } },
      },
      include: {
        property: { include: { location: true } },
        tenant: true,
        application: true,
      },
    });

    // Update application with leaseId - simplified approach
    await prisma.application.update({
      where: { id: Number(applicationId) },
      data: { leaseId: newLease.id },
    });

    return newLease;
  });

  res.status(CREATED).json({
    success: true,
    message: "Lease created successfully",
    lease,
  });
});

export const updateLease = catchAsyncError(async (req: AuthRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  const { status } = req.body;

  // restrict to tenant alone
  if (user.role !== "TENANT") {
    appAssert(false, FORBIDDEN, "You aren't a tenant");
  }

  // Validate input
  if (!status) {
    appAssert(false, BAD_REQUEST, "Status is required");
  }

  const allowedStatuses = ["Pending", "Approved", "Denied"];
  if (!allowedStatuses.includes(status)) {
    appAssert(false, BAD_REQUEST, "Invalid status value");
  }

  // Check if lease exists and belongs to tenant
  const existingLease = await prisma.lease.findUnique({
    where: { id: Number(id) },
    include: { tenant: true, application: true },
  });

  appAssert(existingLease, NOT_FOUND, "Lease not found");

  // Check if the lease belongs to the current tenant
  appAssert(
    existingLease.tenantId === user.id,
    FORBIDDEN,
    "You can only update your own lease"
  );

  // Prevent updating already finalized leases
  if (
    existingLease.status === "Approved" ||
    existingLease.status === "Denied"
  ) {
    appAssert(false, BAD_REQUEST, "Cannot update an already finalized lease");
  }

  // Update lease in transaction
  const updatedLease = await prisma.$transaction(async (prisma) => {
    const lease = await prisma.lease.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        property: { include: { location: true } },
        tenant: true,
        application: true,
      },
    });

    // If tenant approves lease, update application with leaseId
    if (status === "Approved" && lease.application?.id) {
      await prisma.application.update({
        where: { id: lease.application?.id },
        data: { leaseId: lease.id },
      });
    }

    return lease;
  });

  return res.status(OK).json({
    success: true,
    message: `Lease ${status.toLowerCase()} successfully`,
    lease: updatedLease,
  });
});

// GET A LEASE DETAILS
export const getLeaseDetails = catchAsyncError(
  async (req: AuthRequest, res) => {
    // fetch the user
    const user = req.user!;
    // get the leaseid
    const { id } = req.params;

    const lease = await prisma.lease.findUnique({
      where: { id: Number(id) },
      include: {
        property: { include: { location: true, manager: true } },
        tenant: true,
        application: true,
      },
    });

    // assert an eror if no lease
    appAssert(lease, NOT_FOUND, "No Lease found");

    if (user.role === "TENANT" && lease.tenantId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your lease",
        AppErrorCode.UnauthorizedRole
      );
    }
    if (user.role === "MANAGER" && lease.property.managerId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your property",
        AppErrorCode.UnauthorizedRole
      );
    }

    res.status(200).json(lease);
  }
);
