import ResetPasswordForm from "@/components/emails/reset-password-form";

export default function ResetPasswordToken() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full p-5">
        <ResetPasswordForm />
      </div>
    </>
  );
}