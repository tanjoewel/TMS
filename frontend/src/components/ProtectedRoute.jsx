import React from "react";

const ProtectedRoute = () => {
  // runs when the component first mounts, which is when the child pages are loaded.
  useEffect(() => {
    // verify that the user is authorized. To do this, we should check if the user is an admin? No, we should have admin routes as well.
  }, []);

  return <div>ProtectedRoute</div>;
};

export default ProtectedRoute;
