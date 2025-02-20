import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormData } from "@/lib";
import { useUser } from "@/hooks";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const LoginForm = ({ onSignedIn }: { onSignedIn?: () => void }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { login, busy } = useUser();
  const onSubmit: SubmitHandler<LoginFormData> = async (data, event) => {
    event && event.preventDefault();
    login(data).then(() => {
      onSignedIn && onSignedIn();
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          disabled={busy}
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
      <Button type="submit">{busy ? "logging in..." : "Login"}</Button>
    </form>
  );
};
