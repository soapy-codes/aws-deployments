import {
  TranslatePrimaryKey,
  TranslateRequest,
  TranslateResult,
  TranslateResultList,
} from "@a2t/shared-types";
import { fetchAuthSession } from "aws-amplify/auth";

const URL = "https://api.bazaar.builders";

export const translatePublicText = async (request: TranslateRequest) => {
  try {
    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const translation = await result.json();

    if (!result.ok) {
      throw new Error(translation);
    }

    return translation as TranslateResult;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const translateUserText = async (request: TranslateRequest) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const translation = await result.json();

    if (!result.ok) {
      throw new Error(translation);
    }

    return translation as TranslateResult;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const getUserTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return (await result.json()) as TranslateResultList;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export const deleteUserTranslation = async (item: TranslatePrimaryKey) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return (await result.json()) as TranslatePrimaryKey;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};
