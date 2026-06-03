import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Footer() {
  return (
    <footer
      className="py-5 px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
      style={{ borderTop: "1px solid #373737", color: "#555" }}
    >
      <span>
        <span style={{ color: "#2E96FF" }} className="font-bold">DistroMatch</span>
        {" · "}La base de datos de compatibilidad de distribuciones Linux
      </span>
      <span>© {new Date().getFullYear()} DistroMatch · Open Source · Community-driven</span>
    </footer>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#1e1e1e", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                backgroundColor: "#2F2F2F",
                border: "1px solid #373737",
                color: "white",
                borderRadius: "0",
              },
            }}
          />
          <Layout>
            <Router />
          </Layout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
