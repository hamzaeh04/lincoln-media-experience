/** @type {import('next').NextConfig} */
const nextConfig = {
  // The live-voice route loads Kokoro at runtime on your own machine only; never bundle or ship it
  serverExternalPackages: ["kokoro-js"],
  outputFileTracingExcludes: { "*": ["node_modules/kokoro-js/**", "node_modules/onnxruntime-node/**", "node_modules/@huggingface/**"] },
};

export default nextConfig;
