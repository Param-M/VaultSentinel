import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyLinkToken } from "../api/auth";
import { LinkTokenPayload } from "../types/auth.types";

interface UseLinkTokenResult {
  isLoading: boolean;
  isValid: boolean;
  payload: LinkTokenPayload | null;
  token: string | null;
  errorMessage: string | null;
}

export function useLinkToken(): UseLinkTokenResult {
  const [searchParams] = useSearchParams();
  const lt = searchParams.get("lt");

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [payload, setPayload] = useState<LinkTokenPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!lt) {
      setIsLoading(false);
      setIsValid(false);
      setErrorMessage("Access requires a private link. Contact your account manager.");
      return;
    }

    verifyLinkToken(lt)
      .then((result) => {
        if (result.valid) {
          setIsValid(true);
          setPayload(result);
        } else {
          setIsValid(false);
          setErrorMessage(result.message || "This link is invalid or has been revoked.");
        }
      })
      .catch(() => {
        setIsValid(false);
        setErrorMessage("Could not verify access link. Please try again.");
      })
      .finally(() => setIsLoading(false));
  }, [lt]);

  return { isLoading, isValid, payload, token: lt, errorMessage };
}
