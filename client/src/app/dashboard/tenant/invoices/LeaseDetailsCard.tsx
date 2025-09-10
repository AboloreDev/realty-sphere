import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

const LeaseDetailsCard = ({ lease }: any) => {
  console.log(lease);
  if (!lease) return null;

  return (
    <Collapsible className="w-full border rounded-md px-1 py-1 space-y-3 bg-muted/40">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-medium">
          View and review your lease agreement
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm">
            View Lease Details
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="pt-4 space-y-2 text-sm">
        <div>
          <strong>Property:</strong> {lease.property.name}
        </div>
        <div>
          <strong>Rent:</strong> ${lease.rent}
        </div>
        <div>
          <strong>Deposit:</strong> ${lease.deposit}
        </div>
        <div>
          <strong>Start Date:</strong>{" "}
          {new Date(lease.startDate).toLocaleDateString()}
        </div>
        <div>
          <strong>End Date:</strong>{" "}
          {new Date(lease.endDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Status:</strong> {lease.status}
        </div>
        <div>
          <strong>Next Payment Date:</strong>{" "}
          {lease.nextPaymentDate
            ? new Date(lease.nextPaymentDate).toLocaleDateString()
            : "N/A"}
        </div>
        <div>
          <strong>Property Type:</strong> {lease.property.propertyType}
        </div>
        {/* Property Info */}
        <div>
          <h3 className="text-lg font-semibold">Property Information</h3>
          <Separator className="my-2" />
          <div className="text-sm space-y-2">
            <p>
              <strong>Name:</strong> {lease.property?.name}
            </p>
            <p>
              <strong>Description:</strong> {lease.property?.description}
            </p>
            <p>
              <strong>Yearly Price:</strong> ${lease.property?.pricePerMonth}
            </p>

            <p>
              <strong>Address:</strong> {lease.property?.location?.address},{" "}
              {lease.property?.location?.city},{" "}
              {lease.property?.location?.country}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default LeaseDetailsCard;
