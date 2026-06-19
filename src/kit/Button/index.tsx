import styles from "./Button.module.scss";

type ButtonProps = {
  text: string;
  disabled: boolean;
  onClick(): void;
};

export function Button(props: ButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.text}
    </button>
  );
}
