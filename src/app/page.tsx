import Header from "./components/Header";
import NetwordMap from "./components/NetwordMap";

export default function Home() {
  return (
    <main className="h-screen flex flex-col">
      <div>
        <Header title="Dashboard Redes MLP" signatureText="Powered by " logoSrc="/images/mlp_logo.svg" signatureLogoSrc="/images/logo_dp.svg"/>
      </div>
      <NetwordMap />
    </main>
  );
}
