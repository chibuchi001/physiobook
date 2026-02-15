import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-xl rounded-2xl",
        },
      }}
      redirectUrl="/dashboard"
    />
  );
}
