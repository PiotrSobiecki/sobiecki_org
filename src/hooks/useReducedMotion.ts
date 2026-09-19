"use client";

import { useEffect, useState } from "react";
import { isMotionReduced, onMotionPreferenceChange } from "@/utils/motion";

const useReducedMotion = (): boolean => {
  // Serwer renderuje wariant z ruchem; pierwszy efekt na kliencie koryguje.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const sync = () => setReduced(isMotionReduced());
    sync();
    return onMotionPreferenceChange(sync);
  }, []);

  return reduced;
};

export default useReducedMotion;
