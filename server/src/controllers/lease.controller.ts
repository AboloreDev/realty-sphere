import AppErrorCode from "../constants/appErrorCode";
import { FORBIDDEN, NOT_FOUND, OK } from "../constants/httpStatus";
import { AuthRequest } from "../middleware/isAuthenticated";
import prisma from "../prismaClient";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";

// get all lease, landlord only
export const getAllLease = catchAsyncError(async (req: AuthRequest, res) => {
  const user = req.user!;
  let leases;

  // check for leases based on roles
  if (user.role === "TENANT") {
    leases = await prisma.lease.findMany({
      where: { tenantId: user.id },
      include: { tenant: true, property: true },
    });
  }
  if (user.role === "LANDLORD") {
    leases = await prisma.lease.findMany({
      where: { property: { managerId: user?.id } },
      include: { tenant: true, property: true },
    });
  }

  res.status(OK).json(leases);
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
    if (user.role === "LANDLORD" && lease.property.managerId !== user.id) {
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
    res.status(OK).json(payments);
  }
);
