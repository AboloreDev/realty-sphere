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

// get all lease
export const getAllLease = catchAsyncError(async (req: AuthRequest, res) => {
  const user = req.user!;
  let leases;

  // check for leases based on roles
  // fetch all lease for tenant
  if (user.role === "TENANT") {
    leases = await prisma.lease.findMany({
      where: { tenantId: user.id },
      include: { tenant: true, property: true },
    });
  }
  // fetch all lease for the property listed by the landlord
  else if (user.role === "MANAGER") {
    leases = await prisma.lease.findMany({
      where: { property: { managerId: user?.id } },
      include: { property: true },
    });
  } // Assert an error if none is found
  else {
    appAssert(false, NOT_FOUND, "No lease found");
  }

  return res.status(OK).json({
    success: true,
    message: "Lease fetched Successfully",
    leases,
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

    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    // return a response
    return res.status(OK).json({
      success: true,
      message: "Lease fetched Successfully",
      payments,
    });
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
    include: { manager: true, leases: true },
  });

  // if there is no property assert an error
  appAssert(
    property,
    NOT_FOUND,
    "Property not found",
    AppErrorCode.InvalidPropertyId
  );

  // if the item has been leased assert an error
  appAssert(
    property.leases.length === 0,
    NOT_FOUND,
    "This property has been leased",
    AppErrorCode.PropertyUnavailable
  );

  // check if the application status has been approved before creating a lease
  const application = await prisma.application.findFirst({
    where: {
      id: Number(applicationId),
      propertyId: Number(propertyId),
      tenantId,
      status: "Approved",
    },
  });
  // assert an error if there is no approved application status
  appAssert(application, BAD_REQUEST, "Application status not approved");

  // create a lease and update the application then wait till the tenant approves it
  const lease = await prisma.$transaction(async (prisma) => {
    const newLease = await prisma.lease.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        rent: Number(rent),
        deposit: Number(deposit),
        property: { connect: { id: Number(propertyId) } },
        tenant: { connect: { id: tenantId } },
        status: "Pending",
        application: { connect: { id: Number(applicationId) } },
      },
      include: { property: { include: { location: true } }, tenant: true },
    });

    // Update application with leaseId
    await prisma.application.update({
      where: { id: Number(applicationId) },
      data: { lease: { connect: { id: newLease.id } } },
      include: { property: true, tenant: true, lease: true },
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

  // update the lease status
  const updatedLease = await prisma.lease.update({
    where: { id: Number(id) },
    data: { status },
    include: {
      property: { include: { location: true } },
      tenant: true,
      application: true,
    },
  });

  return res.status(OK).json({
    success: true,
    message: "Lease accepted successfully",
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
      include: { property: true, tenant: true, application: true },
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
