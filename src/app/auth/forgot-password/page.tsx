import ForgotPasswordForm from "@/components/emails/forgot-password-form";


export default function ForgotPassword() {

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full p-5">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
