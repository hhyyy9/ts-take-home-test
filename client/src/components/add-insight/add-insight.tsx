import { useState, type FormEvent } from "react";
import type { Insight } from "../../schemas/insight.ts";
import { BRANDS } from "../../lib/consts.ts";
import { Button } from "../button/button.tsx";
import { Modal } from "../modal/modal.tsx";
import styles from "./add-insight.module.css";

type AddInsightProps = {
  open: boolean;
  onClose: () => void;
  onAdd?: (insight: Insight) => void;
};

export const AddInsight = ({ open, onAdd, onClose }: AddInsightProps) => {
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [text, setText] = useState("");

  const addInsight = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`/api/insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand: brandId,
        text,
      }),
    });

    if (!response.ok) {
      return;
    }

    const item = await response.json();

    onAdd?.({
      id: item.id,
      brandId: item.brand,
      date: new Date(item.createdAt),
      text: item.text,
    });

    setText("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h1 className={styles.heading}>Add a new insight</h1>
      <form className={styles.form} onSubmit={addInsight}>
        <label className={styles.field}>
          <select
            className={styles["field-input"]}
            value={brandId}
            onChange={(event) => setBrandId(Number(event.target.value))}
          >
            {BRANDS.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          Insight
          <textarea
            className={styles["field-input"]}
            rows={5}
            placeholder="Something insightful..."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <Button className={styles.submit} type="submit" label="Add insight" />
      </form>
    </Modal>
  );
};
