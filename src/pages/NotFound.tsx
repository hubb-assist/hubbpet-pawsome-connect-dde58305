
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-hubbpet-primary mb-4">404</h1>
        <p className="text-2xl text-gray-700 mb-6">Página não encontrada</p>
        <p className="text-lg text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <a href="/">
          <Button className="bg-hubbpet-primary hover:bg-hubbpet-primary/80">
            Voltar para a Página Inicial
          </Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
