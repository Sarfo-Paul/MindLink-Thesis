import { useRouteChangeGuard } from "../hooks/useRouteGuard";
import { PopUp } from "./PopUp";

export const GameRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showModal, confirmNavigation, cancelNavigation } = useRouteChangeGuard(["guess-what", "stroop"]);

  return (
    <div>
      {children}
      <PopUp
        isOpen={showModal}
        type="warning"
        title="Are you sure?"
        message="Your unsaved changes will be lost."
        onClose={cancelNavigation}
        onConfirm={confirmNavigation}
        confirmText="Yes, Leave"
        cancelText="Stay"
        showCancel
      />
    </div>
  );
};
