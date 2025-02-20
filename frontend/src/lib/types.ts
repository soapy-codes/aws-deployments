import { AuthUser, SignInOutput, SignUpOutput } from "aws-amplify/auth";

export type SignUpState = SignUpOutput["nextStep"];
export type SignInState = SignInOutput["nextStep"];
export type IAuthUser = AuthUser;

export type RegistrationFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type ConfirmRegistrationFormData = {
  email: string;
  verificationCode: string;
};

export type LoginFormData = {
  email: string;
  password: string;
};
