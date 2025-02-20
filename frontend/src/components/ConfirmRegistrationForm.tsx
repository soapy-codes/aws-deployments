import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { SignUpState, ConfirmRegistrationFormData } from "@/lib";
import { useUser } from "@/hooks";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const ConfirmRegistrationForm = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpState) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmRegistrationFormData>();

  const { busy, confirmRegistration } = useUser();

  const onSubmit: SubmitHandler<ConfirmRegistrationFormData> = async (
    data,
    event
  ) => {
    event && event.preventDefault();
    confirmRegistration(data).then((nextStep) => {
      console.log(nextStep?.signUpStep);
      if (nextStep) onStepChange(nextStep);
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          disabled={busy}
          type="email"
          id="email"
          {...register("email", { required: true })}
        />
        {errors.email && <span>field is required</span>}
      </div>
      <div>
        <Label htmlFor="verificationCode">Verification Code</Label>
        <Input
          disabled={busy}
          id="verificationCode"
          type="password"
          {...register("verificationCode", { required: true })}
        />
        {errors.verificationCode && <span>field is required</span>}
      </div>
      <Button type="submit">{busy ? "confirmating" : "Confirm"}</Button>
    </form>
  );
};
