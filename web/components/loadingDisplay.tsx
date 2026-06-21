import { Label, ProgressBar } from "@heroui/react";

export default function LoadingDisplay() {
  return (
    <div className="w-full max-h-svh h-full flex items-center justify-center">
      <ProgressBar isIndeterminate aria-label="Loading" className="max-w-xs">
        <Label>Loading...</Label>
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
