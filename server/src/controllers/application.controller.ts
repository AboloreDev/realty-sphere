import { application } from "express";
import {
  BAD_REQUEST,
  CREATED,
  FORBIDDEN,
  NOT_FOUND,
  OK,
} from "../constants/httpStatus";
import { AuthRequest, restrictTo } from "../middleware/isAuthenticated";
import prisma from "../prismaClient";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";
import calculateNextPaymentDate from "../utils/nextPaymentDateCalcutions";

export const createApplication = catchAsyncError(
  async (req: AuthRequest, res) => {
    const user = req.user!;

    if (user.role !== "TENANT") {
      appAssert(false, FORBIDDEN, "Not a Tenant");
    }
    const { applicationDate, propertyId, name, email, message, phoneNumber } =
      req.body;

    // Validate required fields
    if (!propertyId || !name || !email || !phoneNumber) {
      return appAssert(false, BAD_REQUEST, "Missing required fields");
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        pricePerMonth: true,
        securityDeposit: true,
      },
    });

    appAssert(property, NOT_FOUND, "Property not found");

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
          ...application,
          property: {
            ...application.property,
            address: application.property.location.address,
          },
          landlord: application.property.manager,
          ...lease,
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
    const status = req.body;
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
      data: { status: "Approved" },
      include: {
        property: { include: { location: true, manager: true } },
        tenant: true,
      },
    });

    // return a response
    return res.status(OK).json({
      success: true,
      message: "Apllication updated successfully",
      updateApplications,
    });
  }
);

export const deleteApplications = catchAsyncError(
  async (req: AuthRequest, res) => {
    const { id } = req.params;

    // delete the application
    await prisma.application.delete({
      where: { id: Number(id) },
    });

    return res.status(OK).json({
      success: true,
      message: "Application deleted successfully",
    });
  }
);
