import cn from "classnames";
import { Icon } from "@kit/Icon";
import styles from "./FilterButton.module.scss";

type FilterButtonProps = {
  count: number;
  isVisible: boolean;
  label: string;
  onClick: () => void;
};

export function FilterButton({
  count,
  isVisible,
  label,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      className={cn(
        styles.button,
        !isVisible && styles.hidden,
      )}
      onClick={onClick}
      type="button"
    >
      <span className={styles.label}>{label}</span>
      <strong>{count}</strong>
      <Icon name={isVisible ? "eye" : "eye-off"} size={18} />
    </button>
  );
}
