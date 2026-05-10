"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoveForwardButtonProps {
  projectId: string;
}

/**
 * Renders the "What moves this forward today?" CTA.
 *
 * The endpoint that backs this button (`/api/agents/alyvis/ask`) is
 * scheduled for Task 5.3 and does not exist yet, so the button is
 * disabled here. A tooltip explains the gating to the user.
 *
 * The trigger renders into a `<span>` rather than the disabled button
 * itself because disabled buttons swallow pointer events, which would
 * prevent the tooltip from opening.
 */
export function MoveForwardButton({ projectId }: MoveForwardButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <span className="inline-flex" tabIndex={0}>
              <Button
                variant="outline"
                size="sm"
                disabled
                data-project-id={projectId}
              >
                What moves this forward today?
              </Button>
            </span>
          }
        />
        <TooltipContent>Connect to OpenClaw to enable</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
