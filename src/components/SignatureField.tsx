"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export interface SignatureFieldHandle {
  getDataUrl: () => string | null;
  isEmpty: () => boolean;
  clear: () => void;
}

const SignatureField = forwardRef<SignatureFieldHandle>(function SignatureField(
  _props,
  ref,
) {
  const sigRef = useRef<SignatureCanvas>(null);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      if (!sigRef.current || sigRef.current.isEmpty()) return null;
      return sigRef.current.toDataURL("image/png");
    },
    isEmpty: () => sigRef.current?.isEmpty() ?? true,
    clear: () => sigRef.current?.clear(),
  }));

  const handleClear = () => {
    sigRef.current?.clear();
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border-2 border-ocean-400/40 bg-white shadow-inner">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            className: "h-40 w-full touch-none",
          }}
          penColor="#0c4a6e"
          minWidth={1.5}
          maxWidth={3}
        />
      </div>
      <button
        type="button"
        onClick={handleClear}
        className="w-full rounded-lg border border-ocean-300/50 bg-ocean-900/30 px-4 py-2.5 text-sm font-medium text-ocean-100 transition hover:bg-ocean-800/40 active:scale-[0.98]"
      >
        清除重簽
      </button>
    </div>
  );
});

export default SignatureField;
