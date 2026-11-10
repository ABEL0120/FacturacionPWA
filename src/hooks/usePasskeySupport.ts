import { useState, useEffect } from "react";
import { passkeyService } from "../services/passkeyService";

export const usePasskeySupport = (): boolean => {
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    let active = true;
    passkeyService.isPlatformAvailable().then((available) => {
      if (active) {
        setSupportsPasskey(available || passkeyService.isSupported());
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return supportsPasskey;
};

