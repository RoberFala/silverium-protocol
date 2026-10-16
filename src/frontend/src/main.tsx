import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Dark-first app: activate the class-based dark token block on the root.
document.documentElement.classList.add("dark");

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider
      createOptions={{
        agentOptions: {
          host: new URL(process.env.II_URL || "https://id.ai").origin,
        },
      }}
    >
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
