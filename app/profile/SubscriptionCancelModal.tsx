import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";

export default function CancellationModal({ isOpen, onClose, onSubmit, loading }: any) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationType, setCancellationType] = useState("too_expensive");
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    // Determine final reason based on type and custom reason
    const finalReason = cancellationType === "other" 
      ? customReason 
      : getCancellationReasonText(cancellationType);
      
    onSubmit(finalReason);
  };

  // Helper function to get human-readable reason text
  const getCancellationReasonText = (type:any) => {
    const reasons:any = {
      too_expensive: "Too expensive for my budget",
      not_using: "Not using the service enough",
      missing_features: "Missing features I need",
      switching: "Switching to another service",
      technical_issues: "Technical issues/bugs",
      other: "Other reason"
    };
    return reasons[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Cancel Your Subscription</DialogTitle>
          <DialogDescription>
            We're sorry to see you go. Please help us improve by sharing why you're cancelling.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Please select a reason:</Label>
            <RadioGroup
              value={cancellationType}
              onValueChange={setCancellationType}
              className="grid gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="too_expensive" id="too_expensive" />
                <Label htmlFor="too_expensive">Too expensive for my budget</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_using" id="not_using" />
                <Label htmlFor="not_using">Not using the service enough</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="missing_features" id="missing_features" />
                <Label htmlFor="missing_features">Missing features I need</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="switching" id="switching" />
                <Label htmlFor="switching">Switching to another service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical_issues" id="technical_issues" />
                <Label htmlFor="technical_issues">Technical issues/bugs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other reason</Label>
              </div>
            </RadioGroup>
          </div>

          {cancellationType === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify:</Label>
              <Textarea
                id="custom-reason"
                placeholder="Tell us more about why you're cancelling..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="min-h-24"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="additional-feedback">Additional feedback (optional):</Label>
            <Textarea
              id="additional-feedback"
              placeholder="Is there anything else you'd like us to know?"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Keep Subscription
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={handleSubmit}
            disabled={loading || (cancellationType === "other" && !customReason.trim())}
          >
            {loading ? "Processing..." : "Confirm Cancellation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}