import ProtectedRoute from "@/components/code/ProtectedRoute";
import DashboardLayout from "../layout";

const LandlordPage = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>LanlordPage</div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default LandlordPage;
