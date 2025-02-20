import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { SignUpState, RegistrationFormData } from "@/lib";
import { useUser } from "@/hooks";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const RegistrationForm = ({
  onStepChange,
}: {
  onStepChange: (step: SignUpState) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>();

  const { busy, registration } = useUser();

  const onSubmit: SubmitHandler<RegistrationFormData> = async (data, event) => {
    event && event.preventDefault();
    registration(data).then((nextStep) => {
      console.log(nextStep?.signUpStep);
      if (nextStep) onStepChange(nextStep);
    });
  };

  return (
    <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
        <Label htmlFor="password">Password</Label>
        <Input
          disabled={busy}
          id="password"
          type="password"
          {...register("password", { required: true })}
        />
        {errors.password && <span>field is required</span>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          disabled={busy}
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", { required: true })}
        />
        {errors.confirmPassword && <span>field is required</span>}
      </div>
      <Button type="submit">{busy ? "registering..." : "Register"}</Button>
    </form>
  );
};
