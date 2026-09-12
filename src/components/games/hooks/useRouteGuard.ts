import { useState } from "react";
import { useBlocker } from "react-router-dom";

export const useRouteChangeGuard = (protectedRoutes: string[]) => {
  const [showModal, setShowModal] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      protectedRoutes.some(route => currentLocation.pathname.includes(route)) &&
      currentLocation.pathname !== nextLocation.pathname
  );

  if (blocker.state === "blocked" && !showModal) {
    setShowModal(true);
  }

  const confirmNavigation = () => {
    blocker.proceed?.();
    setShowModal(false);
  };

  const cancelNavigation = () => {
    blocker.reset?.();
    setShowModal(false);
  };

  return {
    showModal,
    confirmNavigation,
    cancelNavigation,
  };
};

