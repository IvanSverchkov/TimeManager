import { useState } from "react";

import { Icon } from "@kit/Icon";
import { copyToClipboard } from "@utils/copyToClipboard";
import { secondsAsHours } from "@utils/secondsAsHours";

import styles from "./CopyButton.module.scss";

type CopyButtonProps = {
  seconds: Array<number>;
};

export function CopyButton(props: CopyButtonProps) {
  const [clicked, setClicked] = useState(false);

  const onClick = () => {
    setClicked(true);

    window.setTimeout(() => setClicked(false), 2000);

    copyToClipboard(
      props.seconds.map((value) => secondsAsHours(value, 2)).join("\n"),
    );
  };

  return (
    <button className={styles.copyButton} onClick={onClick} type="button">
      <Icon name={clicked ? "check" : "copy"} size={20} />
      <span>{clicked ? "Copied" : "Copy report"}</span>
    </button>
  );
}
