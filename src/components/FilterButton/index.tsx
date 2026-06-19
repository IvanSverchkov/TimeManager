import cn from "classnames";
import styles from "./FilterButton.module.scss";

type FilterButtonProps = {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
};

export function FilterButton({ active, count, label, onClick }: FilterButtonProps) {
  return (
    <button
      className={cn(
        styles.button,
        active && styles.active,
      )}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  );
}