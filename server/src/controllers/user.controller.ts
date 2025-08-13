import { NOT_FOUND } from "../constants/httpStatus";
import prisma from "../prismaClient";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";

export const getUserProfile = catchAsyncError(async (req, res) => {
  // get the user
  const user = await prisma.user.findUnique({
    // @ts-ignore
    where: { id: req.user.id },
  });
  // asserts if there is no user found
  appAssert(user, NOT_FOUND, "user not found");

  // return the response
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});
