"use client";

import { useCallback, useEffect, useState } from "react";
import {
  signIn,
  getCurrentUser,
  signOut,
  signUp,
  confirmSignUp,
  autoSignIn,
} from "aws-amplify/auth";
import { useApp } from "@/components";
import {
  ConfirmRegistrationFormData,
  LoginFormData,
  RegistrationFormData,
  SignInState,
  SignUpState,
} from "@/lib";
import { useRouter } from "next/navigation";

export const useUser = () => {
  const [busy, setBusy] = useState<boolean>(false);
  const { user, setUser, setError, resetError } = useApp();

  useEffect(() => {
    async function fetchUser() {
      setBusy(true);
      await getUser();
      setBusy(false);
    }
    fetchUser();
  }, []);

  const getUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const login = useCallback(async ({ email, password }: LoginFormData) => {
    try {
      setBusy(true);
      resetError();
      await signIn({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });
      await getUser();
    } catch (error: unknown) {
      setError((error as Error).toString());
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setBusy(true);
      resetError();
      await signOut();
      setUser(null);
    } catch (error) {
      setError((error as Error).toString());
    } finally {
      setBusy(false);
    }
  }, []);

  const registration = async ({
    email,
    password,
    confirmPassword,
  }: RegistrationFormData): Promise<SignUpState | null> => {
    let authNextStep = null;
    try {
      setBusy(true);
      resetError();
      if (password !== confirmPassword) {
        throw new Error("passwords do not match");
      }
      const { nextStep } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: { email },
          autoSignIn: true,
        },
      });

      authNextStep = nextStep as SignUpState;
    } catch (error) {
      setError((error as Error).toString());
    } finally {
      setBusy(false);
      return authNextStep;
    }
  };

  const confirmRegistration = async ({
    email,
    verificationCode,
  }: ConfirmRegistrationFormData) => {
    let authNextStep = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      });

      authNextStep = nextStep;
    } catch (error: unknown) {
      setError((error as Error).toString());
    } finally {
      setBusy(false);
      return authNextStep;
    }
  };

  const autoLogin = useCallback(async (): Promise<SignInState | null> => {
    let authNextStep = null;
    try {
      setBusy(true);
      resetError();
      const { nextStep } = await autoSignIn();
      authNextStep = nextStep as SignInState;
      await getUser();
    } catch (error: unknown) {
      setError((error as Error).toString());
    } finally {
      setBusy(false);
      return authNextStep;
    }
  }, []);

  return {
    busy,
    user,
    login,
    registration,
    confirmRegistration,
    autoLogin,
    logout,
  };
};
