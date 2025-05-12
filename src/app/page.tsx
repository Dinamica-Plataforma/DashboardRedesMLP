import Header from "./components/common/Header";
import { Section } from "./components/common/HeaderSection";

const sections: Section[] = [
  {
    label: "Inicio", href: "/",
  },
  { label: "red", href:"/red" }
];

export default function Home() {
  return (
    <div>
      <Header sections={sections} />
    </div>
  );
}
