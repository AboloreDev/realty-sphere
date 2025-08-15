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

export const createApplication = catchAsyncError(
  async (req: AuthRequest, res) => {
    try {
      const user = req.user!;
      console.log("Request body:", req.body); // Debug: Log the incoming body

      // Check if req.body is defined
      if (!req.body) {
        return appAssert(false, BAD_REQUEST, "Request body is missing");
      }

      const { applicationDate, propertyId, name, email, message, phoneNumber } =
        req.body;

      if (user.role !== "TENANT") {
        return appAssert(false, FORBIDDEN, "Not a Tenant");
      }

      // Validate required fields
      if (!propertyId || !name || !email || !phoneNumber) {
        return appAssert(false, BAD_REQUEST, "Missing required fields");
      }

      // Validate propertyId exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          pricePerMonth: true,
          securityDeposit: true,
        },
      });

      appAssert(property, NOT_FOUND, "Property not found");

      // Create the application
      const newApplication = await prisma.application.create({
        data: {
          applicationDate: new Date(applicationDate || Date.now()),
          status: "Pending",
          name,
          email,
          phoneNumber,
          message,
          property: { connect: { id: propertyId } },
          tenant: { connect: { id: user.id } },
        },
        include: {
          property: { include: { location: true, manager: true } },
          tenant: true,
        },
      });

      return res.status(CREATED).json({
        success: true,
        message: "Application was successful",
        newApplication,
      });
    } catch (error: any) {
      console.error("Error in createApplication:", error); // Log the error
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message, // Include error details for debugging
      });
    }
  }
);

export const listApplications = catchAsyncError(
  async (req: AuthRequest, res) => {
    const user = req.user!;
    let applications: any[] = [];

    // fetch Applications based on roles
    // for tenant
    if (user.role === "TENANT") {
      applications = await prisma.application.findMany({
        where: { tenantId: user.id },
        include: {
          property: { include: { location: true, manager: true } },
          tenant: true,
        },
      });
    }
    // for landlord
    else if (user.role === "MANAGER") {
      applications = await prisma.application.findMany({
        where: { property: { managerId: user.id } },
        include: {
          property: { include: { location: true, manager: true } },
          tenant: true,
        },
      });
    }

    // after getting the applications, format the application fetch to only show the lease associated with it
    const formattedApplications = await Promise.all(
      applications.map(async (application) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: { id: application.tenantId },
            propertyId: application.propertyId,
          },
          orderBy: { startDate: "desc" },
        });

        // show next payment date if lease exists
        const nextPaymentDate = lease
          ? calculateNextPaymentDate(lease.startDate, lease.endDate)
          : null;

        return {
          id: application.id,
          applicationDate: application.applicationDate,
          status: application.status,
          propertyId: application.propertyId,
          tenantId: application.tenantId,
          name: application.name,
          email: application.email,
          phoneNumber: application.phoneNumber,
          message: application.message,
          leaseId: application.leaseId,
          property: {
            ...application.property,
            address: application.property.location.address,
          },
          landlord: application.property.manager,
          lease: lease
            ? {
                id: lease.id,
                startDate: lease.startDate,
                endDate: lease.endDate,
                rent: lease.rent,
                deposit: lease.deposit,
                propertyId: lease.propertyId,
                tenantId: lease.tenantId,
                leaseStatus: lease.status,
              }
            : undefined,
          nextPaymentDate,
        };
      })
    );

    // RETURN A RESPONSE
    return res.status(OK).json({
      success: true,
      message: "Applications fetched Successfully",
      formattedApplications,
    });
  }
);

export const updateApplications = catchAsyncError(
  async (req: AuthRequest, res) => {
    //GET THE ID FROM THE PARAMS
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user!;

    if (user.role !== "MANAGER") {
      appAssert(false, FORBIDDEN, "Only landlords can update application");
    }

    // validate the application and check if it exists
    const applications = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: { property: true, tenant: true },
    });

    // asert an error if no applications
    appAssert(applications, NOT_FOUND, "Application not found");

    // update appliation
    const updateApplications = await prisma.application.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        property: { include: { location: true, manager: true } },
        tenant: true,
      },
    });

    // return a response
    return res.status(OK).json({
      success: true,
      message: "Application updated successfully",
      updateApplications,
    });
  }
);

// GET A APPLICATION DETAILS
export const getApplicationDetails = catchAsyncError(
  async (req: AuthRequest, res) => {
    // fetch the user
    const user = req.user!;
    // get the leaseid
    const { id } = req.params;

    const application = await prisma.lease.findUnique({
      where: { id: Number(id) },
      include: { property: true, tenant: true },
    });

    // assert an eror if no lease
    appAssert(application, NOT_FOUND, "No Application found");

    if (user.role === "TENANT" && application.tenantId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your application",
        AppErrorCode.UnauthorizedRole
      );
    }
    if (user.role === "MANAGER" && application.property.managerId !== user.id) {
      return appAssert(
        false,
        FORBIDDEN,
        "Access denied: Not your property",
        AppErrorCode.UnauthorizedRole
      );
    }

    res.status(200).json(application);
  }
);
