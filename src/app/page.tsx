import Header from "./components/Header";
import NetwordMap from "./components/NetwordMap";
import PoweredBy from "./components/SignBottomRight"; // Importa el componente de la firma

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <div>
        <Header title="Dashboard Redes MLP" logoSrc="/images/logo_mlp.svg"/>
      </div>
      <NetwordMap />
      
      {/* Aquí se integra el componente PoweredBy */}
      <PoweredBy logoSrc="/images/logo_dp.svg" signatureText="Powered by" />
    </main>
  );
}
