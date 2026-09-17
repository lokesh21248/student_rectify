import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In — EduEvents",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <SignIn
          appearance={{
            elements: {
              card: "shadow-lg rounded-3xl border border-slate-200",
              formButtonPrimary: "bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
