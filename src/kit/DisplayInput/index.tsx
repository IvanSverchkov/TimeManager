import cn from "classnames";

import styles from "./DisplayInput.module.scss";

type DisplayInputProps = {
  value: string;
  className?: string;
  size?: number;
  weight?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
};

export const DisplayInput = (props: DisplayInputProps) => {
  return (
    <input
      className={cn(
        styles.input,
        props.className,
      )}
      style={{
        fontWeight: props.weight,
        fontSize: props.size,
      }}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => {
        props.onChange?.(e.target.value);
      }}
    />
  )
}
