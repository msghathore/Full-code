import { SignIn } from "@clerk/clerk-react";

const StaffSignIn = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <SignIn signUpUrl="/auth/staff-signup" redirectUrl="/staff/dashboard" />
    </div>
  );
};

export default StaffSignIn;