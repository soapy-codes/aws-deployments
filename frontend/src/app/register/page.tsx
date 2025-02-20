"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUpState, SignInState } from "@/lib";
import { ConfirmRegistrationForm, RegistrationForm } from "@/components";
import { useUser } from "@/hooks";

function AutoSignIn({
  onStepChange,
}: {
  onStepChange: (step: SignInState) => void;
}) {
  const { autoLogin } = useUser();
  useEffect(() => {
    autoLogin().then((nextStep) => {
      if (nextStep) {
        console.log(nextStep);
        onStepChange(nextStep);
      }
    });
  }, []);
  return <div>signing in...</div>;
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<SignUpState | SignInState | null>(null);

  useEffect(() => {
    if (!step) return;
    if ((step as SignInState).signInStep === "DONE") {
      router.push("/");
    }
  }, [step, router]);

  if (step) {
    if ((step as SignUpState).signUpStep === "CONFIRM_SIGN_UP") {
      return <ConfirmRegistrationForm onStepChange={setStep} />;
    }

    if ((step as SignUpState).signUpStep === "COMPLETE_AUTO_SIGN_IN") {
      return <AutoSignIn onStepChange={setStep} />;
    }
  }
  return (
    <main className="flex flex-col m-8">
      <RegistrationForm onStepChange={setStep} />
    </main>
  );
}
