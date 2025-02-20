"use client";
// create a user component
import { getCurrentUser, signOut } from "aws-amplify/auth";
import { useEffect, useState } from "react";
import { LoginForm } from "@/components/LoginForm";

function Logout({ onSignedOut }: { onSignedOut: () => void }) {
  return (
    <div>
      <button
        className="btn bg-blue-500"
        onClick={async () => {
          await signOut();
          onSignedOut();
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default function User() {
  const [user, setUser] = useState<object | null | undefined>(undefined);
  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        console.log(currentUser);
        setUser(currentUser);
      } catch (e) {
        console.log(e);
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  if (user === undefined) {
    return <p>loading...</p>;
  }

  if (user) {
    return <Logout onSignedOut={() => setUser(null)} />;
  }
  return (
    <LoginForm
      onSignedIn={async () => {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }}
    />
  );
}
