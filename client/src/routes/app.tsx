import { useEffect, useState } from "react";
import { Header } from "../components/header/header.tsx";
import { Insights } from "../components/insights/insights.tsx";
import styles from "./app.module.css";
import type { Insight } from "../schemas/insight.ts";

const toInsight = (item: {
  id: number;
  brand: number;
  createdAt: string;
  text: string;
}): Insight => ({
  id: item.id,
  brandId: item.brand,
  date: new Date(item.createdAt),
  text: item.text,
});

export const App = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  const handleCreate = (insight: Insight) => {
    setInsights((prev) => [...prev, insight]);
  };

  const handleDelete = (id: number) => {
    fetch(`/api/insights/${id}`, { method: "DELETE" }).then((res) => {
      if (res.ok) {
        setInsights((prev) => prev.filter((insight) => insight.id !== id));
      }
    });
  };

  useEffect(() => {
    fetch(`/api/insights`)
      .then((res) => res.json())
      .then((data) => setInsights(data.map(toInsight)));
  }, []);

  return (
    <main className={styles.main}>
      <Header onAdd={handleCreate} />
      <Insights
        className={styles.insights}
        insights={insights}
        onDelete={handleDelete}
      />
    </main>
  );
};
